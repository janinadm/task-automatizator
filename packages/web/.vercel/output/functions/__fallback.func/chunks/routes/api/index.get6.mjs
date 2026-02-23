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
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  const { orgId } = dbUser;
  const members = await prisma.user.findMany({
    where: { orgId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedTickets: true
        }
      }
    }
  });
  const resolvedCounts = await prisma.ticket.groupBy({
    by: ["assignedToId"],
    where: {
      orgId,
      status: { in: ["RESOLVED", "CLOSED"] },
      assignedToId: { not: null }
    },
    _count: { assignedToId: true }
  });
  const resolvedMap = new Map(
    resolvedCounts.filter((r) => r.assignedToId).map((r) => [r.assignedToId, r._count.assignedToId])
  );
  const team = members.map((m) => {
    var _a;
    return {
      id: m.id,
      email: m.email,
      fullName: m.fullName,
      role: m.role,
      avatarUrl: m.avatarUrl,
      isActive: m.isActive,
      createdAt: m.createdAt,
      assignedTickets: m._count.assignedTickets,
      resolvedTickets: (_a = resolvedMap.get(m.id)) != null ? _a : 0
    };
  });
  return {
    data: {
      team,
      totalMembers: team.length,
      currentUserRole: dbUser.role
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index.get6.mjs.map
