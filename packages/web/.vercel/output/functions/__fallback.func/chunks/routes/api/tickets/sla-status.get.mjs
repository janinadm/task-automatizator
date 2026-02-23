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

const slaStatus_get = defineEventHandler(async (event) => {
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
  const slaConfigs = await prisma.slaConfig.findMany({
    where: { orgId: dbUser.orgId }
  });
  const slaMap = new Map(slaConfigs.map((s) => [s.priority, s.maxResponseMinutes]));
  const tickets = await prisma.ticket.findMany({
    where: {
      orgId: dbUser.orgId,
      status: { in: ["OPEN", "IN_PROGRESS"] }
    },
    select: {
      id: true,
      subject: true,
      priority: true,
      status: true,
      createdAt: true,
      firstResponseAt: true,
      assignedTo: { select: { fullName: true } }
    },
    orderBy: { createdAt: "asc" }
  });
  const now = /* @__PURE__ */ new Date();
  const slaStatuses = tickets.map((ticket) => {
    var _a, _b, _c, _d, _e;
    const maxMinutes = (_a = slaMap.get(ticket.priority)) != null ? _a : null;
    const minutesElapsed = Math.floor((now.getTime() - ticket.createdAt.getTime()) / 6e4);
    const isResponded = !!ticket.firstResponseAt;
    let minutesRemaining = null;
    let isBreached = false;
    let breachSeverity = "none";
    if (maxMinutes !== null && !isResponded) {
      minutesRemaining = maxMinutes - minutesElapsed;
      isBreached = minutesRemaining <= 0;
      if (isBreached) {
        breachSeverity = minutesRemaining < -maxMinutes ? "critical" : "breached";
      } else if (minutesRemaining <= maxMinutes * 0.25) {
        breachSeverity = "warning";
      }
    }
    return {
      ticketId: ticket.id,
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      firstResponseAt: (_c = (_b = ticket.firstResponseAt) == null ? void 0 : _b.toISOString()) != null ? _c : null,
      maxResponseMinutes: maxMinutes,
      minutesElapsed,
      minutesRemaining,
      isBreached,
      breachSeverity,
      assignedTo: (_e = (_d = ticket.assignedTo) == null ? void 0 : _d.fullName) != null ? _e : null
    };
  });
  const breachedCount = slaStatuses.filter((s) => s.isBreached).length;
  const warningCount = slaStatuses.filter((s) => s.breachSeverity === "warning").length;
  const healthyCount = slaStatuses.filter((s) => s.breachSeverity === "none").length;
  return {
    data: {
      statuses: slaStatuses,
      summary: {
        total: slaStatuses.length,
        breached: breachedCount,
        warning: warningCount,
        healthy: healthyCount
      }
    }
  };
});

export { slaStatus_get as default };
//# sourceMappingURL=sla-status.get.mjs.map
