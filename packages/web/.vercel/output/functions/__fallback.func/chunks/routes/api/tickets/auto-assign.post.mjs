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

const autoAssign_post = defineEventHandler(async (event) => {
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
  if (dbUser.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Only admins can trigger auto-assignment" });
  }
  const org = await prisma.organization.findUnique({
    where: { id: dbUser.orgId },
    select: { autoAssign: true }
  });
  if (!(org == null ? void 0 : org.autoAssign)) {
    throw createError({ statusCode: 400, message: "Auto-assignment is not enabled for this organization" });
  }
  const agents = await prisma.user.findMany({
    where: {
      orgId: dbUser.orgId,
      isActive: true,
      role: { in: ["ADMIN", "AGENT"] }
    },
    select: {
      id: true,
      fullName: true,
      _count: {
        select: {
          assignedTickets: {
            where: { status: { in: ["OPEN", "IN_PROGRESS"] } }
          }
        }
      }
    },
    orderBy: {
      assignedTickets: { _count: "asc" }
    }
  });
  if (agents.length === 0) {
    throw createError({ statusCode: 400, message: "No active agents available for assignment" });
  }
  const unassignedTickets = await prisma.ticket.findMany({
    where: {
      orgId: dbUser.orgId,
      assignedToId: null,
      status: { in: ["OPEN", "IN_PROGRESS"] }
    },
    select: { id: true },
    orderBy: [
      { priority: "desc" },
      // URGENT first
      { createdAt: "asc" }
      // Oldest first
    ]
  });
  if (unassignedTickets.length === 0) {
    return { data: { assignedCount: 0, message: "No unassigned tickets to assign" } };
  }
  const assignments = [];
  for (let i = 0; i < unassignedTickets.length; i++) {
    const agent = agents[i % agents.length];
    assignments.push({
      ticketId: unassignedTickets[i].id,
      agentId: agent.id,
      agentName: agent.fullName
    });
  }
  await prisma.$transaction(
    assignments.map(
      (a) => prisma.ticket.update({
        where: { id: a.ticketId },
        data: {
          assignedToId: a.agentId,
          status: "IN_PROGRESS"
        }
      })
    )
  );
  return {
    data: {
      assignedCount: assignments.length,
      assignments: assignments.map((a) => ({
        ticketId: a.ticketId,
        agentName: a.agentName
      }))
    }
  };
});

export { autoAssign_post as default };
//# sourceMappingURL=auto-assign.post.mjs.map
