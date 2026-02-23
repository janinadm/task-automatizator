import { d as defineEventHandler, c as createError, a as getRouterParam, r as readBody } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import { d as UpdateTicketSchema } from '../../../_/index.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';
import 'zod';

const _id__patch = defineEventHandler(async (event) => {
  var _a, _b;
  const authUser = event.context.user;
  if (!authUser) throw createError({ statusCode: 401, message: "Unauthorized" });
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing ticket ID" });
  const body = await readBody(event);
  const result = UpdateTicketSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true }
  });
  if (!dbUser) throw createError({ statusCode: 404, message: "User not found" });
  const existing = await prisma.ticket.findUnique({
    where: { id },
    select: { orgId: true, status: true }
  });
  if (!existing) throw createError({ statusCode: 404, message: "Ticket not found" });
  if (existing.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const updateData = result.data;
  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...updateData,
      // Auto-set resolvedAt when moving to RESOLVED/CLOSED
      // (Auto-establecer resolvedAt al mover a RESOLVED/CLOSED)
      ...updateData.status === "RESOLVED" || updateData.status === "CLOSED" ? { resolvedAt: /* @__PURE__ */ new Date() } : {}
    },
    include: {
      assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
      _count: { select: { messages: true, aiSuggestions: true } }
    }
  });
  return { data: updated };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
