/**
 * API Route: GET /api/tickets
 *
 * Returns a paginated, filterable list of tickets for the current organization.
 *
 * QUERY PARAMS (all optional):
 * - page: number (default 1)
 * - limit: number (default 20, max 100)
 * - status: TicketStatus | TicketStatus[]
 * - priority: Priority | Priority[]
 * - sentiment: Sentiment | Sentiment[]
 * - channel: Channel | Channel[]
 * - assignedAgentId: string (UUID)
 * - search: string (searches title + customerName + customerEmail)
 * - sortBy: 'createdAt' | 'updatedAt' | 'priority' | 'slaDeadline' (default createdAt)
 * - sortOrder: 'asc' | 'desc' (default desc)
 *
 * (Retorna una lista paginada y filtrable de tickets para la organización actual.
 *  PARÁMETROS DE CONSULTA (todos opcionales):
 *  - page, limit, status, priority, sentiment, channel, assignedAgentId, search, sortBy, sortOrder)
 */

import { prisma } from '@ata/db'
import { TicketFiltersSchema } from '@ata/shared'
import type { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Get the user's orgId from DB (not from query param — security!)
  // (Obtener orgId del usuario desde BD — no del parámetro de consulta — seguridad)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }, // 'orgId' is the FK in the User model
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  // Parse and validate query params with Zod
  // getQuery() reads all URL query params as a plain object
  // (Parsear y validar parámetros de consulta con Zod)
  // (getQuery() lee todos los parámetros de URL como un objeto plano)
  const rawQuery = getQuery(event)
  const filtersResult = TicketFiltersSchema.safeParse(rawQuery)

  if (!filtersResult.success) {
    throw createError({
      statusCode: 400,
      message: filtersResult.error.errors[0]?.message ?? 'Invalid query parameters',
    })
  }

  const {
    page = 1,
    pageSize: limit = 20,   // schema uses 'pageSize'; rename to 'limit' locally for clarity
    status,
    priority,
    sentiment,
    channel,
    assignedToId,           // schema uses 'assignedToId' (not 'assignedAgentId')
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filtersResult.data

  // Build the Prisma where clause dynamically
  // We only add conditions for filters that are actually set
  // (Construir la cláusula where de Prisma dinámicamente)
  // (Solo añadimos condiciones para filtros que estén configurados)
  const where: Prisma.TicketWhereInput = {
    orgId: dbUser.orgId,    // multi-tenant filter: only this org's tickets
    // Spread conditions conditionally using the "filter && { condition }" pattern
    ...(status && { status: Array.isArray(status) ? { in: status } : status }),
    ...(priority && { priority: Array.isArray(priority) ? { in: priority } : priority }),
    ...(sentiment && { sentiment: Array.isArray(sentiment) ? { in: sentiment } : sentiment }),
    ...(channel && { channel: Array.isArray(channel) ? { in: channel } : channel }),
    ...(assignedToId && { assignedToId }), // 'assignedToId' is the FK field name
    ...(search && {
      OR: [
        // Prisma's 'contains' + 'mode: insensitive' = case-insensitive search
        // (El 'contains' + 'mode: insensitive' de Prisma = búsqueda sin distinción de mayúsculas)
        { subject: { contains: search, mode: 'insensitive' } }, // 'subject' (not 'title')
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  // Run total count + data queries in parallel
  // (Ejecutar consulta de conteo total + datos en paralelo)
  const skip = (page - 1) * limit
  const [total, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        assignedTo: {         // 'assignedTo' is the relation name in Prisma schema
          select: { id: true, fullName: true, avatarUrl: true }, // 'fullName' (not 'name')
        },
        _count: {
          select: { messages: true, aiSuggestions: true },
        },
      },
    }),
  ])

  // Add SLA breach flag — URGENT tickets open for more than 2 hours
  // (Note: no slaDeadline column in schema; Phase 7 will add a proper SLA engine)
  // (Agregar bandera de SLA: tickets URGENTES abiertos más de 2 horas)
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
  const data = tickets.map(t => ({
    ...t,
    isBreachingSla:
      t.priority === 'URGENT' &&
      ['OPEN', 'IN_PROGRESS'].includes(t.status) &&
      t.createdAt < twoHoursAgo,
  }))

  // PaginatedResponse format (Formato de respuesta paginada)
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  }
})
