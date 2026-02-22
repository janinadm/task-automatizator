/**
 * API Route: GET /api/dashboard/stats
 *
 * Returns the KPI numbers displayed on the dashboard home page:
 * - Open tickets count
 * - Resolved today count
 * - SLA-breaching tickets count
 * - AI suggestions generated count
 * - Sentiment breakdown (positive/neutral/negative)
 * - Tickets by priority
 * - Agent performance (who closed the most today)
 *
 * MULTI-TENANCY: Every query filters by the caller's organizationId.
 * Users from Agency A should NEVER see Agency B's data.
 * This is enforced by injecting organizationId from our Prisma User record
 * (which was set at signup) — not from a query param (never trust the client!)
 *
 * (MULTI-TENANCIA: Cada consulta filtra por organizationId del usuario actual.
 *  Los usuarios de la Agencia A NUNCA deben ver datos de la Agencia B.
 *  Esto se aplica inyectando organizationId desde el registro Prisma del usuario,
 *  no desde un parámetro de consulta — ¡nunca confiar en el cliente!)
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  // Require authentication (Requerir autenticación)
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  // Fetch the caller's organization from Prisma (not from request params!)
  // (Obtener la organización del usuario desde Prisma — no de los parámetros de la solicitud)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }, // 'orgId' is the FK field name in the User model
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  const { orgId } = dbUser

  // --- TODAY'S TIMESTAMPS ---
  // We need these for "resolved today" and "SLA breach" checks
  // (Necesitamos estos para "resueltos hoy" y verificaciones de SLA)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // --- PARALLEL QUERIES ---
  // Promise.all fires all DB queries at the same time instead of one by one.
  // This turns N sequential round-trips (slow!) into 1 parallel batch (fast!).
  // (Promise.all dispara todas las consultas BD al mismo tiempo en lugar de una por una.
  //  Esto convierte N round-trips secuenciales (¡lento!) en 1 lote paralelo (¡rápido!))
  const [
    openCount,
    resolvedTodayCount,
    slaBreachingCount,
    aiSuggestionsCount,
    sentimentBreakdown,
    priorityBreakdown,
    recentTickets,
  ] = await Promise.all([
    // 1. Open tickets (Tickets abiertos)
    prisma.ticket.count({
      where: {
        orgId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    }),

    // 2. Resolved today (Resueltos hoy)
    prisma.ticket.count({
      where: {
        orgId,
        status: { in: ['RESOLVED', 'CLOSED'] },
        updatedAt: { gte: todayStart, lte: todayEnd },
      },
    }),

    // 3. SLA "breaching": URGENT tickets open for more than 2 hours
    // Note: the Ticket schema has no dedicated slaDeadline column — we simulate
    // it with a time delta. Phase 7 will add a proper SLA engine.
    // (SLA "incumpliendo": tickets URGENTES abiertos más de 2 horas)
    // (Nota: el esquema Ticket no tiene columna slaDeadline — lo simulamos con delta de tiempo)
    prisma.ticket.count({
      where: {
        orgId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        priority: 'URGENT',
        createdAt: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // older than 2 hours
      },
    }),

    // 4. AI suggestions generated (Sugerencias de AI generadas)
    // 'aiSuggestion' is the Prisma camelCase name for the AiSuggestion model
    // (aiSuggestion es el nombre camelCase de Prisma para el modelo AiSuggestion)
    prisma.aiSuggestion.count({
      where: { ticket: { orgId } },
    }),

    // 5. Sentiment breakdown (groupBy returns counts per value)
    // (Desglose de sentimiento — groupBy retorna conteos por valor)
    prisma.ticket.groupBy({
      by: ['sentiment'],
      where: { orgId, sentiment: { not: null } },
      _count: { sentiment: true },
    }),

    // 6. Priority breakdown (Desglose por prioridad)
    prisma.ticket.groupBy({
      by: ['priority'],
      where: { orgId },
      _count: { priority: true },
      orderBy: { priority: 'desc' },
    }),

    // 7. Recent tickets for dashboard table (10 most recent)
    // (Tickets recientes para la tabla del dashboard — los 10 más recientes)
    prisma.ticket.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        subject: true,     // 'subject' in schema (not 'title')
        status: true,
        priority: true,
        sentiment: true,
        sentimentScore: true,
        category: true,
        channel: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: {      // 'assignedTo' is the relation name in schema (not 'assignedAgent')
          select: { id: true, fullName: true, avatarUrl: true },
        },
        _count: { select: { messages: true } },
      },
    }),
  ])

  // --- TRANSFORM GROUPED DATA ---
  // Convert Prisma's groupBy array into an object for easy lookup on the frontend
  // (Convertir el array groupBy de Prisma en un objeto para fácil acceso en el frontend)
  const sentimentMap: Record<string, number> = {}
  for (const row of sentimentBreakdown) {
    if (row.sentiment) {
      sentimentMap[row.sentiment] = row._count.sentiment
    }
  }

  const priorityMap: Record<string, number> = {}
  for (const row of priorityBreakdown) {
    priorityMap[row.priority] = row._count.priority
  }

  // Add isBreachingSla flag to each ticket (Agregar bandera isBreachingSla a cada ticket)
  // Since we have no slaDeadline column, URGENT tickets open >2h are considered breaching
  // (Phase 7 will add a proper per-org SLA engine)
  // (Como no hay columna slaDeadline, tickets URGENTES abiertos >2h se consideran en incumplimiento)
  const now = new Date()
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)
  const ticketsWithSlaFlag = recentTickets.map((ticket: typeof recentTickets[0]) => ({
    ...ticket,
    isBreachingSla:
      ticket.priority === 'URGENT' &&
      ['OPEN', 'IN_PROGRESS'].includes(ticket.status) &&
      ticket.createdAt < twoHoursAgo,
  }))

  return {
    data: {
      // KPI numbers (Números KPI)
      openTickets: openCount,
      resolvedToday: resolvedTodayCount,
      slaBreaching: slaBreachingCount,
      aiSuggestionsGenerated: aiSuggestionsCount,

      // Breakdowns (Desglose)
      sentiment: {
        positive: sentimentMap['POSITIVE'] ?? 0,
        neutral: sentimentMap['NEUTRAL'] ?? 0,
        negative: sentimentMap['NEGATIVE'] ?? 0,
      },
      priority: {
        urgent: priorityMap['URGENT'] ?? 0,
        high: priorityMap['HIGH'] ?? 0,
        medium: priorityMap['MEDIUM'] ?? 0,
        low: priorityMap['LOW'] ?? 0,
      },

      // Recent tickets (Tickets recientes)
      recentTickets: ticketsWithSlaFlag,
    },
  }
})
