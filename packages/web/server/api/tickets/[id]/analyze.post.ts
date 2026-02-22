/**
 * API Route: POST /api/tickets/[id]/analyze
 * File: server/api/tickets/[id]/analyze.post.ts
 *
 * On-demand AI analysis endpoint. Agents can click "Analyze with AI" on any ticket
 * to get fresh analysis and a suggested reply.
 *
 * This is different from the auto-enrichment on ticket creation:
 * - Auto-enrichment runs once at creation (fire-and-forget)
 * - This endpoint is manual, on-demand, and returns the results to the client
 * - It also generates a SUGGESTED REPLY and saves it to the ai_suggestions table
 *
 * FLOW:
 * 1. Agent clicks "Analyze with AI" button on the ticket detail page
 * 2. Frontend POSTs to /api/tickets/{id}/analyze
 * 3. Server runs analyzeTicket() + suggestReply() with Gemini
 * 4. Updates the ticket fields (sentiment, priority, category, etc.)
 * 5. Saves the suggested reply to ai_suggestions table
 * 6. Returns everything to the frontend
 *
 * (Este endpoint es de análisis de IA bajo demanda. Los agentes pueden hacer clic
 *  en "Analizar con IA" en cualquier ticket para obtener un análisis fresco y
 *  una respuesta sugerida.)
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing ticket ID' })

  // Get user's org for authorization (Obtener org del usuario para autorización)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  // Fetch the ticket with its messages (Obtener el ticket con sus mensajes)
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        select: { body: true, senderType: true },
      },
    },
  })

  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })
  if (ticket.orgId !== dbUser.orgId) throw createError({ statusCode: 403, message: 'Forbidden' })

  // ── Run both AI tasks in parallel for speed ─────────────────────────────────
  // Promise.all runs both API calls simultaneously instead of sequentially
  // This halves the total wait time (2 API calls × ~1.5s = ~1.5s instead of ~3s)
  //
  // (Promise.all ejecuta ambas llamadas API simultáneamente en vez de secuencialmente
  //  Esto reduce a la mitad el tiempo total de espera)
  const [analysis, reply] = await Promise.all([
    analyzeTicket(ticket.subject, ticket.body),
    suggestReply(
      ticket.subject,
      ticket.body,
      ticket.messages,
      ticket.sentiment,
      ticket.category,
    ),
  ])

  // ── Update ticket fields + create AI suggestion in a transaction ─────────────
  // A Prisma transaction ensures both operations succeed or both fail (atomicity)
  // (Una transacción de Prisma asegura que ambas operaciones tengan éxito o ambas fallen)
  const [updatedTicket, aiSuggestion] = await prisma.$transaction([
    prisma.ticket.update({
      where: { id },
      data: {
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        priority: analysis.priority,
        category: analysis.category,
        language: analysis.language,
        summary: analysis.summary,
      },
    }),
    prisma.aiSuggestion.create({
      data: {
        ticketId: id,
        suggestedReply: reply.suggestedReply,
        confidence: reply.confidence,
      },
    }),
  ])

  return {
    data: {
      analysis,
      suggestion: {
        id: aiSuggestion.id,
        suggestedReply: reply.suggestedReply,
        confidence: reply.confidence,
        reasoning: reply.reasoning,
      },
      updatedTicket,
    },
  }
})
