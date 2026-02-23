import { d as defineEventHandler, c as createError, a as getRouterParam } from '../../../nitro/nitro.mjs';
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

const _id__get = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) throw createError({ statusCode: 401, message: "Unauthorized" });
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing ticket ID" });
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }
  });
  if (!dbUser) throw createError({ statusCode: 404, message: "User not found" });
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        // Conversation order (Orden de conversación)
        include: {
          sender: {
            select: { id: true, fullName: true, avatarUrl: true, role: true }
          }
        }
      },
      aiSuggestions: {
        orderBy: { createdAt: "desc" },
        take: 5
        // Latest 5 suggestions (Últimas 5 sugerencias)
      },
      assignedTo: {
        select: { id: true, fullName: true, avatarUrl: true, email: true }
      },
      org: {
        select: { id: true, name: true, plan: true }
      }
    }
  });
  if (!ticket) throw createError({ statusCode: 404, message: "Ticket not found" });
  if (ticket.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1e3);
  const isBreachingSla = ticket.priority === "URGENT" && ["OPEN", "IN_PROGRESS"].includes(ticket.status) && ticket.createdAt < twoHoursAgo;
  return {
    data: {
      ...ticket,
      isBreachingSla
    }
  };
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
