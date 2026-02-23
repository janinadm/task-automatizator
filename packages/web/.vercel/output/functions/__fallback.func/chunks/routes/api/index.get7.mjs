import { d as defineEventHandler, c as createError, g as getQuery } from '../../nitro/nitro.mjs';
import { p as prisma } from '../../_/client.mjs';
import { T as TicketFiltersSchema } from '../../_/index.mjs';
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

const index_get = defineEventHandler(async (event) => {
  var _a, _b;
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }
    // 'orgId' is the FK in the User model
  });
  if (!dbUser) throw createError({ statusCode: 404, message: "User not found" });
  const rawQuery = getQuery(event);
  const filtersResult = TicketFiltersSchema.safeParse(rawQuery);
  if (!filtersResult.success) {
    throw createError({
      statusCode: 400,
      message: (_b = (_a = filtersResult.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Invalid query parameters"
    });
  }
  const {
    page = 1,
    pageSize: limit = 20,
    // schema uses 'pageSize'; rename to 'limit' locally for clarity
    status,
    priority,
    sentiment,
    channel,
    assignedToId,
    // schema uses 'assignedToId' (not 'assignedAgentId')
    search,
    sortBy = "createdAt",
    sortOrder = "desc"
  } = filtersResult.data;
  const where = {
    orgId: dbUser.orgId,
    // multi-tenant filter: only this org's tickets
    // Spread conditions conditionally using the "filter && { condition }" pattern
    ...status && { status: Array.isArray(status) ? { in: status } : status },
    ...priority && { priority: Array.isArray(priority) ? { in: priority } : priority },
    ...sentiment && { sentiment: Array.isArray(sentiment) ? { in: sentiment } : sentiment },
    ...channel && { channel: Array.isArray(channel) ? { in: channel } : channel },
    ...assignedToId && { assignedToId },
    // 'assignedToId' is the FK field name
    ...search && {
      OR: [
        // Prisma's 'contains' + 'mode: insensitive' = case-insensitive search
        // (El 'contains' + 'mode: insensitive' de Prisma = búsqueda sin distinción de mayúsculas)
        { subject: { contains: search, mode: "insensitive" } },
        // 'subject' (not 'title')
        { customerName: { contains: search, mode: "insensitive" } },
        { customerEmail: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } }
      ]
    }
  };
  const skip = (page - 1) * limit;
  const [total, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        assignedTo: {
          // 'assignedTo' is the relation name in Prisma schema
          select: { id: true, fullName: true, avatarUrl: true }
          // 'fullName' (not 'name')
        },
        _count: {
          select: { messages: true, aiSuggestions: true }
        }
      }
    })
  ]);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1e3);
  const data = tickets.map((t) => ({
    ...t,
    isBreachingSla: t.priority === "URGENT" && ["OPEN", "IN_PROGRESS"].includes(t.status) && t.createdAt < twoHoursAgo
  }));
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index.get7.mjs.map
