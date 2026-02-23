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
    select: { orgId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }, // Conversation order (Orden de conversación)
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true, role: true },
          },
        },
      },
      aiSuggestions: {
        orderBy: { createdAt: 'desc' },
        take: 5, // Latest 5 suggestions (Últimas 5 sugerencias)
      },
      assignedTo: {
        select: { id: true, fullName: true, avatarUrl: true, email: true },
      },
      tags: {
        include: { tag: true },
      },
      org: {
        select: { id: true, name: true, plan: true },
      },
    },
  })

  // 404 if not found (No encontrado)
  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })

  // AUTHORIZATION: verify this ticket belongs to the caller's org
  // Even if someone guesses the UUID, they can't read another org's ticket
  // (AUTORIZACIÓN: verificar que este ticket pertenece a la org del usuario)
  if (ticket.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // SLA approximation: URGENT tickets open for more than 2 hours are breaching SLA
  // (Aproximación SLA: tickets URGENT abiertos más de 2 horas están incumpliendo SLA)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const isBreachingSla =
    ticket.priority === 'URGENT' &&
    ['OPEN', 'IN_PROGRESS'].includes(ticket.status) &&
    ticket.createdAt < twoHoursAgo

  return {
    data: {
      ...ticket,
      isBreachingSla,
    },
  }
})
