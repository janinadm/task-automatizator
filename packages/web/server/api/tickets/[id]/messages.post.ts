/**
 * API Route: POST /api/tickets/[id]/messages
 *
 * Adds a new message to a ticket's conversation thread.
 * Called by the reply form on the ticket detail page.
 *
 * MESSAGE TYPES (senderType):
 * - CUSTOMER: inbound message from the customer
 * - AGENT: reply from a human agent
 * - AI: AI-generated suggestion (used by Phase 6 AI engine)
 *
 * (TIPOS DE MENSAJE:
 *  - CUSTOMER: mensaje entrante del cliente
 *  - AGENT: respuesta de un agente humano
 *  - AI: sugerencia generada por IA (usada por el motor de IA en Fase 6))
 */

import { prisma } from '@ata/db'
import { CreateMessageSchema } from '@ata/shared'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing ticket ID' })

  const body = await readBody(event)
  const result = CreateMessageSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  // Verify the ticket belongs to the caller's org (Verificar que el ticket pertenece a la org)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, id: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { orgId: true },
  })
  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })
  if (ticket.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // Create the message (Crear el mensaje)
  // Schema field is `body` (not `content`) — matches the TicketMessage Prisma model
  // (El campo del schema es `body` — coincide con el modelo TicketMessage de Prisma)
  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      body: result.data.body,
      // senderType tells us who sent it (agent or AI, not customer for inbound here)
      // (senderType nos dice quién lo envió)
      senderType: result.data.senderType,
      // Link to the agent user if they sent it (Vincular al agente si lo envió)
      ...(result.data.senderType === 'AGENT' && { senderId: dbUser.id }),
    },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } },
    },
  })

  // Update ticket's updatedAt timestamp (Actualizar timestamp updatedAt del ticket)
  await prisma.ticket.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return { data: message }
})
