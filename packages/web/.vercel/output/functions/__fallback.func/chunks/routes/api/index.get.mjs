import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { p as prisma } from '../../_/client.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const index_get = defineEventHandler(async (event) => {
  var _a, _b, _c;
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  const { orgId } = dbUser;
  const now = /* @__PURE__ */ new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1e3);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1e3);
  const todayStart = /* @__PURE__ */ new Date();
  todayStart.setHours(0, 0, 0, 0);
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
    ticketsToday
  ] = await Promise.all([
    // Total tickets
    prisma.ticket.count({ where: { orgId } }),
    // Open tickets
    prisma.ticket.count({
      where: { orgId, status: { in: ["OPEN", "IN_PROGRESS"] } }
    }),
    // Resolved tickets
    prisma.ticket.count({
      where: { orgId, status: { in: ["RESOLVED", "CLOSED"] } }
    }),
    // Average resolution time (resolved tickets with resolvedAt)
    prisma.ticket.findMany({
      where: {
        orgId,
        status: { in: ["RESOLVED", "CLOSED"] },
        resolvedAt: { not: null }
      },
      select: { createdAt: true, resolvedAt: true },
      take: 500,
      orderBy: { resolvedAt: "desc" }
    }),
    // By channel
    prisma.ticket.groupBy({
      by: ["channel"],
      where: { orgId },
      _count: { channel: true }
    }),
    // By status
    prisma.ticket.groupBy({
      by: ["status"],
      where: { orgId },
      _count: { status: true }
    }),
    // By priority
    prisma.ticket.groupBy({
      by: ["priority"],
      where: { orgId },
      _count: { priority: true }
    }),
    // Sentiment breakdown
    prisma.ticket.groupBy({
      by: ["sentiment"],
      where: { orgId, sentiment: { not: null } },
      _count: { sentiment: true }
    }),
    // Category breakdown
    prisma.ticket.groupBy({
      by: ["category"],
      where: { orgId, category: { not: null } },
      _count: { category: true },
      orderBy: { _count: { category: "desc" } },
      take: 10
    }),
    // Agent performance: resolved tickets per agent
    prisma.ticket.groupBy({
      by: ["assignedToId"],
      where: {
        orgId,
        status: { in: ["RESOLVED", "CLOSED"] },
        assignedToId: { not: null }
      },
      _count: { assignedToId: true },
      orderBy: { _count: { assignedToId: "desc" } },
      take: 10
    }),
    // Tickets in the last 30 days (for volume chart)
    prisma.ticket.findMany({
      where: {
        orgId,
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" }
    }),
    // Tickets this week
    prisma.ticket.count({
      where: { orgId, createdAt: { gte: sevenDaysAgo } }
    }),
    // Tickets today
    prisma.ticket.count({
      where: { orgId, createdAt: { gte: todayStart } }
    })
  ]);
  let avgResolutionHours = 0;
  if (avgResolutionData.length > 0) {
    const totalMs = avgResolutionData.reduce((acc, t) => {
      if (t.resolvedAt) {
        return acc + (t.resolvedAt.getTime() - t.createdAt.getTime());
      }
      return acc;
    }, 0);
    avgResolutionHours = Math.round(totalMs / avgResolutionData.length / (1e3 * 60 * 60) * 10) / 10;
  }
  const dailyVolume = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1e3);
    const dateStr = d.toISOString().split("T")[0];
    const count = recentTickets30d.filter((t) => {
      const tDate = t.createdAt.toISOString().split("T")[0];
      return tDate === dateStr;
    }).length;
    dailyVolume.push({ date: dateStr, count });
  }
  const channels = {};
  for (const row of ticketsByChannel) {
    channels[row.channel] = row._count.channel;
  }
  const statuses = {};
  for (const row of ticketsByStatus) {
    statuses[row.status] = row._count.status;
  }
  const priorities = {};
  for (const row of ticketsByPriority) {
    priorities[row.priority] = row._count.priority;
  }
  const sentiment = {};
  for (const row of sentimentBreakdown) {
    if (row.sentiment) sentiment[row.sentiment] = row._count.sentiment;
  }
  const categories = categoryBreakdown.filter((r) => r.category).map((r) => ({ name: r.category, count: r._count.category }));
  const agentIds = agentPerformance.filter((a) => a.assignedToId).map((a) => a.assignedToId);
  const agents = agentIds.length > 0 ? await prisma.user.findMany({
    where: { id: { in: agentIds } },
    select: { id: true, fullName: true, avatarUrl: true }
  }) : [];
  const agentMap = new Map(agents.map((a) => [a.id, a]));
  const agentStats = agentPerformance.filter((a) => a.assignedToId).map((a) => {
    var _a2, _b2, _c2, _d;
    return {
      id: a.assignedToId,
      name: (_b2 = (_a2 = agentMap.get(a.assignedToId)) == null ? void 0 : _a2.fullName) != null ? _b2 : "Unknown",
      avatarUrl: (_d = (_c2 = agentMap.get(a.assignedToId)) == null ? void 0 : _c2.avatarUrl) != null ? _d : null,
      resolved: a._count.assignedToId
    };
  });
  const resolutionRate = totalTickets > 0 ? Math.round(resolvedTickets / totalTickets * 100) : 0;
  return {
    data: {
      overview: {
        totalTickets,
        openTickets,
        resolvedTickets,
        avgResolutionHours,
        resolutionRate,
        ticketsThisWeek,
        ticketsToday
      },
      dailyVolume,
      channels,
      statuses,
      priorities,
      sentiment: {
        positive: (_a = sentiment["POSITIVE"]) != null ? _a : 0,
        neutral: (_b = sentiment["NEUTRAL"]) != null ? _b : 0,
        negative: (_c = sentiment["NEGATIVE"]) != null ? _c : 0
      },
      categories,
      agentPerformance: agentStats
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index.get.mjs.map
