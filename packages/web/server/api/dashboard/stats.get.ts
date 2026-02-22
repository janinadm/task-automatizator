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
    select: { organizationId: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  const { organizationId } = dbUser

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
        organizationId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
      },
    }),

    // 2. Resolved today (Resueltos hoy)
    prisma.ticket.count({
      where: {
        organizationId,
        status: { in: ['RESOLVED', 'CLOSED'] },
        updatedAt: { gte: todayStart, lte: todayEnd },
      },
    }),

    // 3. SLA breaching: open tickets where slaDeadline is in the past
    // (SLA incumpliendo: tickets abiertos donde slaDeadline ya pasó)
    prisma.ticket.count({
      where: {
        organizationId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        slaDeadline: { lt: new Date() }, // lt = less than = in the past
      },
    }),

    // 4. AI suggestions generated (Sugerencias de AI generadas)
    prisma.aISuggestion.count({
      where: { ticket: { organizationId } },
    }),

    // 5. Sentiment breakdown (groupBy returns counts per value)
    // (Desglose de sentimiento — groupBy retorna conteos por valor)
    prisma.ticket.groupBy({
      by: ['sentiment'],
      where: { organizationId, sentiment: { not: null } },
      _count: { sentiment: true },
    }),

    // 6. Priority breakdown (Desglose por prioridad)
    prisma.ticket.groupBy({
      by: ['priority'],
      where: { organizationId },
      _count: { priority: true },
      orderBy: { priority: 'desc' },
    }),

    // 7. Recent tickets for dashboard table (10 most recent)
    // (Tickets recientes para la tabla del dashboard — los 10 más recientes)
    prisma.ticket.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        sentiment: true,
        sentimentScore: true,
        category: true,
        channel: true,
        createdAt: true,
        updatedAt: true,
        slaDeadline: true,
        assignedAgent: {
          select: { id: true, name: true, avatarUrl: true },
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
  const now = new Date()
  const ticketsWithSlaFlag = recentTickets.map(ticket => ({
    ...ticket,
    isBreachingSla: ticket.slaDeadline
      ? ticket.slaDeadline < now && ['OPEN', 'IN_PROGRESS'].includes(ticket.status)
      : false,
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
