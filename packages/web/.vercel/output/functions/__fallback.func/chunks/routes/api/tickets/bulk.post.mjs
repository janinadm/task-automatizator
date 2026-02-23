import { d as defineEventHandler, c as createError, r as readBody } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import { B as BulkTicketActionSchema } from '../../../_/index.mjs';
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

const bulk_post = defineEventHandler(async (event) => {
  var _a, _b;
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
  const body = await readBody(event);
  const result = BulkTicketActionSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const { ticketIds, action, value } = result.data;
  const ticketCount = await prisma.ticket.count({
    where: {
      id: { in: ticketIds },
      orgId: dbUser.orgId
    }
  });
  if (ticketCount !== ticketIds.length) {
    throw createError({ statusCode: 403, message: "Some tickets do not belong to your organization" });
  }
  let updateData = {};
  switch (action) {
    case "updateStatus":
      if (!value || !["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(value)) {
        throw createError({ statusCode: 400, message: "Invalid status value" });
      }
      updateData = {
        status: value,
        ...value === "RESOLVED" ? { resolvedAt: /* @__PURE__ */ new Date() } : {}
      };
      break;
    case "updatePriority":
      if (!value || !["LOW", "MEDIUM", "HIGH", "URGENT"].includes(value)) {
        throw createError({ statusCode: 400, message: "Invalid priority value" });
      }
      updateData = { priority: value };
      break;
    case "assign":
      if (!value) {
        throw createError({ statusCode: 400, message: "Agent ID is required for assignment" });
      }
      const agent = await prisma.user.findFirst({
        where: { id: value, orgId: dbUser.orgId, isActive: true }
      });
      if (!agent) {
        throw createError({ statusCode: 404, message: "Agent not found in your organization" });
      }
      updateData = { assignedToId: value, status: "IN_PROGRESS" };
      break;
    case "unassign":
      updateData = { assignedToId: null };
      break;
    default:
      throw createError({ statusCode: 400, message: "Invalid action" });
  }
  const updated = await prisma.ticket.updateMany({
    where: {
      id: { in: ticketIds },
      orgId: dbUser.orgId
    },
    data: updateData
  });
  return {
    data: {
      updatedCount: updated.count,
      action,
      value: value != null ? value : null
    }
  };
});

export { bulk_post as default };
//# sourceMappingURL=bulk.post.mjs.map
