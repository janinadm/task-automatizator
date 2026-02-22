/**
 * API Route: GET /api/tickets/[id]
 *
 * Returns a single ticket with:
 * - All messages (conversation thread) ordered oldest → newest
 * - AI suggestions for this ticket
 * - Assigned agent info
 *
 * [id] is a Nuxt dynamic route param (like Express's :id).
 * Nitro maps the filename [id].get.ts → GET /api/tickets/:id
 *
 * ([id] es un parámetro de ruta dinámico de Nuxt (como :id de Express).
 *  Nitro mapea el archivo [id].get.ts → GET /api/tickets/:id)
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  // getRouterParam extracts path params from the URL (/api/tickets/abc-123 → 'abc-123')
  // (getRouterParam extrae parámetros de ruta de la URL)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing ticket ID' })

  // Get user's org for multi-tenant authorization check
  // (Obtener la org del usuario para verificación de autorización multi-tenant)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { organizationId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }, // Conversation order (Orden de conversación)
        include: {
          sender: {
            select: { id: true, name: true, avatarUrl: true, role: true },
          },
        },
      },
      aiSuggestions: {
        orderBy: { createdAt: 'desc' },
        take: 5, // Latest 5 suggestions (Últimas 5 sugerencias)
      },
      assignedAgent: {
        select: { id: true, name: true, avatarUrl: true, email: true },
      },
      organization: {
        select: { id: true, name: true, plan: true },
      },
    },
  })

  // 404 if not found (No encontrado)
  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })

  // AUTHORIZATION: verify this ticket belongs to the caller's org
  // Even if someone guesses the UUID, they can't read another org's ticket
  // (AUTORIZACIÓN: verificar que este ticket pertenece a la org del usuario)
  // (Incluso si alguien adivina el UUID, no puede leer el ticket de otra org)
  if (ticket.organizationId !== dbUser.organizationId) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  const now = new Date()
  return {
    data: {
      ...ticket,
      isBreachingSla: ticket.slaDeadline
        ? ticket.slaDeadline < now && ['OPEN', 'IN_PROGRESS'].includes(ticket.status)
        : false,
    },
  }
})
