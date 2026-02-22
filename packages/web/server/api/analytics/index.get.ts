/**
 * API Route: GET /api/analytics
 *
 * Returns advanced analytics data for the Analytics page:
 * - Ticket volume over time (last 30 days)
 * - Average resolution time
 * - Tickets by channel
 * - Tickets by status
 * - Sentiment trends
 * - Top categories
 * - Agent performance leaderboard
 *
 * MULTI-TENANCY: every query scoped to caller's orgId.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  const { orgId } = dbUser

  // Date ranges
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    totalTickets,
    openTickets,
    resolvedTickets,
    avgResolutionData,
    ticketsByChannel,
    ticketsByStatus,
    ticketsByPriority,
    sentimentBreakdown,
    categoryBreakdown,
    agentPerformance,
    recentTickets30d,
    ticketsThisWeek,
    ticketsToday,
  ] = await Promise.all([
    // Total tickets
    prisma.ticket.count({ where: { orgId } }),

    // Open tickets
    prisma.ticket.count({
      where: { orgId, status: { in: ['OPEN', 'IN_PROGRESS'] } },
    }),

    // Resolved tickets
    prisma.ticket.count({
      where: { orgId, status: { in: ['RESOLVED', 'CLOSED'] } },
    }),

    // Average resolution time (resolved tickets with resolvedAt)
    prisma.ticket.findMany({
      where: {
        orgId,
        status: { in: ['RESOLVED', 'CLOSED'] },
        resolvedAt: { not: null },
      },
      select: { createdAt: true, resolvedAt: true },
      take: 500,
      orderBy: { resolvedAt: 'desc' },
    }),

    // By channel
    prisma.ticket.groupBy({
      by: ['channel'],
      where: { orgId },
      _count: { channel: true },
    }),

    // By status
    prisma.ticket.groupBy({
      by: ['status'],
      where: { orgId },
      _count: { status: true },
    }),

    // By priority
    prisma.ticket.groupBy({
      by: ['priority'],
      where: { orgId },
      _count: { priority: true },
    }),

    // Sentiment breakdown
    prisma.ticket.groupBy({
      by: ['sentiment'],
      where: { orgId, sentiment: { not: null } },
      _count: { sentiment: true },
    }),

    // Category breakdown
    prisma.ticket.groupBy({
      by: ['category'],
      where: { orgId, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 10,
    }),

    // Agent performance: resolved tickets per agent
    prisma.ticket.groupBy({
      by: ['assignedToId'],
      where: {
        orgId,
        status: { in: ['RESOLVED', 'CLOSED'] },
        assignedToId: { not: null },
      },
      _count: { assignedToId: true },
      orderBy: { _count: { assignedToId: 'desc' } },
      take: 10,
    }),

    // Tickets in the last 30 days (for volume chart)
    prisma.ticket.findMany({
      where: {
        orgId,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    }),

    // Tickets this week
    prisma.ticket.count({
      where: { orgId, createdAt: { gte: sevenDaysAgo } },
    }),

    // Tickets today
    prisma.ticket.count({
      where: { orgId, createdAt: { gte: todayStart } },
    }),
  ])

  // Calculate avg resolution time in hours
  let avgResolutionHours = 0
  if (avgResolutionData.length > 0) {
    const totalMs = avgResolutionData.reduce((acc, t) => {
      if (t.resolvedAt) {
        return acc + (t.resolvedAt.getTime() - t.createdAt.getTime())
      }
      return acc
    }, 0)
    avgResolutionHours = Math.round((totalMs / avgResolutionData.length / (1000 * 60 * 60)) * 10) / 10
  }

  // Build daily volume for last 30 days
  const dailyVolume: { date: string; count: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const dateStr = d.toISOString().split('T')[0] as string
    const count = recentTickets30d.filter((t) => {
      const tDate = t.createdAt.toISOString().split('T')[0]
      return tDate === dateStr
    }).length
    dailyVolume.push({ date: dateStr, count })
  }

  // Transform channel breakdown
  const channels: Record<string, number> = {}
  for (const row of ticketsByChannel) {
    channels[row.channel] = row._count.channel
  }

  // Transform status breakdown
  const statuses: Record<string, number> = {}
  for (const row of ticketsByStatus) {
    statuses[row.status] = row._count.status
  }

  // Transform priority breakdown
  const priorities: Record<string, number> = {}
  for (const row of ticketsByPriority) {
    priorities[row.priority] = row._count.priority
  }

  // Transform sentiment
  const sentiment: Record<string, number> = {}
  for (const row of sentimentBreakdown) {
    if (row.sentiment) sentiment[row.sentiment] = row._count.sentiment
  }

  // Transform categories
  const categories = categoryBreakdown
    .filter((r) => r.category)
    .map((r) => ({ name: r.category!, count: r._count.category }))

  // Fetch agent names for performance
  const agentIds = agentPerformance
    .filter((a) => a.assignedToId)
    .map((a) => a.assignedToId!)
  const agents = agentIds.length > 0
    ? await prisma.user.findMany({
        where: { id: { in: agentIds } },
        select: { id: true, fullName: true, avatarUrl: true },
      })
    : []

  const agentMap = new Map(agents.map((a) => [a.id, a]))
  const agentStats = agentPerformance
    .filter((a) => a.assignedToId)
    .map((a) => ({
      id: a.assignedToId!,
      name: agentMap.get(a.assignedToId!)?.fullName ?? 'Unknown',
      avatarUrl: agentMap.get(a.assignedToId!)?.avatarUrl ?? null,
      resolved: a._count.assignedToId,
    }))

  // Resolution rate
  const resolutionRate = totalTickets > 0
    ? Math.round((resolvedTickets / totalTickets) * 100)
    : 0

  return {
    data: {
      overview: {
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResolutionHours,
        resolutionRate,
        ticketsThisWeek,
        ticketsToday,
      },
      dailyVolume,
      channels,
      statuses,
      priorities,
      sentiment: {
        positive: sentiment['POSITIVE'] ?? 0,
        neutral: sentiment['NEUTRAL'] ?? 0,
        negative: sentiment['NEGATIVE'] ?? 0,
      },
      categories,
      agentPerformance: agentStats,
    },
  }
})
