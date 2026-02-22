/**
 * API Route: POST /api/tickets
 * File: server/api/tickets/index.post.ts
 *
 * Creates a new support ticket. After creation, the ticket is automatically
 * analyzed by Gemini AI in the background to enrich it with:
 * - Sentiment analysis (POSITIVE / NEUTRAL / NEGATIVE)
 * - Priority recommendation (LOW / MEDIUM / HIGH / URGENT)
 * - Category classification (billing, technical, etc.)
 * - Language detection
 * - AI-generated summary
 *
 * WHY BACKGROUND AI ENRICHMENT?
 * We don't want the user to wait 2-3 seconds for the AI to analyze the ticket
 * before getting a response. Instead:
 * 1. Create the ticket immediately → return 201 to the client (fast!)
 * 2. Fire the AI analysis in the background (async, no await)
 * 3. When the AI finishes, update the ticket's fields in the database
 * 4. Supabase Realtime automatically pushes the UPDATE to all connected clients
 *
 * This is called "fire and forget" — the API responds fast, AI runs behind the scenes.
 *
 * (¿POR QUÉ ENRIQUECIMIENTO IA EN SEGUNDO PLANO?
 *  No queremos que el usuario espere 2-3 segundos para que la IA analice el ticket.
 *  En su lugar: crear el ticket inmediatamente → retornar 201 al cliente (rápido!)
 *  → ejecutar el análisis IA en segundo plano → cuando termina, actualizar los campos
 *  → Supabase Realtime envía la actualización automáticamente a todos los clientes)
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // Get the user's org for multi-tenant scoping
  // (Obtener la org del usuario para el alcance multi-tenant)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, id: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  // Read and validate the request body (Leer y validar el cuerpo de la solicitud)
  const body = await readBody(event)

  if (!body?.subject || !body?.body) {
    throw createError({
      statusCode: 400,
      message: 'subject and body are required',
    })
  }

  // Create the ticket in the database (Crear el ticket en la base de datos)
  const ticket = await prisma.ticket.create({
    data: {
      subject: String(body.subject).slice(0, 200),
      body: String(body.body).slice(0, 5000),
      channel: body.channel || 'WEB',
      customerName: body.customerName || null,
      customerEmail: body.customerEmail || null,
      orgId: dbUser.orgId,
      // priority and sentiment will be filled by AI in the background
      // (prioridad y sentimiento serán llenados por la IA en segundo plano)
    },
  })

  // ── Fire-and-forget AI enrichment ──────────────────────────────────────────
  // We do NOT await this — it runs in the background while the 201 response is sent
  // The .catch() ensures errors don't crash the server (they're just logged)
  //
  // (NO esperamos esto — corre en segundo plano mientras se envía la respuesta 201
  //  El .catch() asegura que los errores no crasheen el servidor — solo se loguean)
  analyzeTicket(ticket.subject, ticket.body)
    .then(async (analysis: Awaited<ReturnType<typeof analyzeTicket>>) => {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: {
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          priority: analysis.priority,
          category: analysis.category,
          language: analysis.language,
          summary: analysis.summary,
        },
      })
      console.log(`[AI] Enriched ticket ${ticket.id}: ${analysis.category} / ${analysis.sentiment} / ${analysis.priority}`)
    })
    .catch((err: unknown) => {
      console.error(`[AI] Failed to enrich ticket ${ticket.id}:`, err)
    })

  // Return immediately — don't wait for AI (Retornar inmediatamente — no esperar a la IA)
  setResponseStatus(event, 201)
  return { data: ticket }
})
