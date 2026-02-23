import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const stats_get = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f, _g;
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }
    // 'orgId' is the FK field name in the User model
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  const { orgId } = dbUser;
  const todayStart = /* @__PURE__ */ new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = /* @__PURE__ */ new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const [
    openCount,
    resolvedTodayCount,
    slaBreachingCount,
    aiSuggestionsCount,
    sentimentBreakdown,
    priorityBreakdown,
    recentTickets
  ] = await Promise.all([
    // 1. Open tickets (Tickets abiertos)
    prisma.ticket.count({
      where: {
        orgId,
        status: { in: ["OPEN", "IN_PROGRESS"] }
      }
    }),
    // 2. Resolved today (Resueltos hoy)
    prisma.ticket.count({
      where: {
        orgId,
        status: { in: ["RESOLVED", "CLOSED"] },
        updatedAt: { gte: todayStart, lte: todayEnd }
      }
    }),
    // 3. SLA "breaching": URGENT tickets open for more than 2 hours
    // Note: the Ticket schema has no dedicated slaDeadline column — we simulate
    // it with a time delta. Phase 7 will add a proper SLA engine.
    // (SLA "incumpliendo": tickets URGENTES abiertos más de 2 horas)
    // (Nota: el esquema Ticket no tiene columna slaDeadline — lo simulamos con delta de tiempo)
    prisma.ticket.count({
      where: {
        orgId,
        status: { in: ["OPEN", "IN_PROGRESS"] },
        priority: "URGENT",
        createdAt: { lt: new Date(Date.now() - 2 * 60 * 60 * 1e3) }
        // older than 2 hours
      }
    }),
    // 4. AI suggestions generated (Sugerencias de AI generadas)
    // 'aiSuggestion' is the Prisma camelCase name for the AiSuggestion model
    // (aiSuggestion es el nombre camelCase de Prisma para el modelo AiSuggestion)
    prisma.aiSuggestion.count({
      where: { ticket: { orgId } }
    }),
    // 5. Sentiment breakdown (groupBy returns counts per value)
    // (Desglose de sentimiento — groupBy retorna conteos por valor)
    prisma.ticket.groupBy({
      by: ["sentiment"],
      where: { orgId, sentiment: { not: null } },
      _count: { sentiment: true }
    }),
    // 6. Priority breakdown (Desglose por prioridad)
    prisma.ticket.groupBy({
      by: ["priority"],
      where: { orgId },
      _count: { priority: true },
      orderBy: { priority: "desc" }
    }),
    // 7. Recent tickets for dashboard table (10 most recent)
    // (Tickets recientes para la tabla del dashboard — los 10 más recientes)
    prisma.ticket.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        subject: true,
        // 'subject' in schema (not 'title')
        status: true,
        priority: true,
        sentiment: true,
        sentimentScore: true,
        category: true,
        channel: true,
        createdAt: true,
        updatedAt: true,
        assignedTo: {
          // 'assignedTo' is the relation name in schema (not 'assignedAgent')
          select: { id: true, fullName: true, avatarUrl: true }
        },
        _count: { select: { messages: true } }
      }
    })
  ]);
  const sentimentMap = {};
  for (const row of sentimentBreakdown) {
    if (row.sentiment) {
      sentimentMap[row.sentiment] = row._count.sentiment;
    }
  }
  const priorityMap = {};
  for (const row of priorityBreakdown) {
    priorityMap[row.priority] = row._count.priority;
  }
  const now = /* @__PURE__ */ new Date();
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1e3);
  const ticketsWithSlaFlag = recentTickets.map((ticket) => ({
    ...ticket,
    isBreachingSla: ticket.priority === "URGENT" && ["OPEN", "IN_PROGRESS"].includes(ticket.status) && ticket.createdAt < twoHoursAgo
  }));
  return {
    data: {
      // KPI numbers (Números KPI)
      openTickets: openCount,
      resolvedToday: resolvedTodayCount,
      slaBreaching: slaBreachingCount,
      aiSuggestionsGenerated: aiSuggestionsCount,
      // Breakdowns (Desglose)
      sentiment: {
        positive: (_a = sentimentMap["POSITIVE"]) != null ? _a : 0,
        neutral: (_b = sentimentMap["NEUTRAL"]) != null ? _b : 0,
        negative: (_c = sentimentMap["NEGATIVE"]) != null ? _c : 0
      },
      priority: {
        urgent: (_d = priorityMap["URGENT"]) != null ? _d : 0,
        high: (_e = priorityMap["HIGH"]) != null ? _e : 0,
        medium: (_f = priorityMap["MEDIUM"]) != null ? _f : 0,
        low: (_g = priorityMap["LOW"]) != null ? _g : 0
      },
      // Recent tickets (Tickets recientes)
      recentTickets: ticketsWithSlaFlag
    }
  };
});

export { stats_get as default };
//# sourceMappingURL=stats.get.mjs.map
