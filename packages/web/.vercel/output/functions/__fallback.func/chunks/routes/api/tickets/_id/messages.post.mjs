import { d as defineEventHandler, c as createError, a as getRouterParam, r as readBody } from '../../../../nitro/nitro.mjs';
import { p as prisma } from '../../../../_/client.mjs';
import { e as CreateMessageSchema } from '../../../../_/index.mjs';
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

const messages_post = defineEventHandler(async (event) => {
  var _a, _b;
  const authUser = event.context.user;
  if (!authUser) throw createError({ statusCode: 401, message: "Unauthorized" });
  const id = getRouterParam(event, "id");
  if (!id) throw createError({ statusCode: 400, message: "Missing ticket ID" });
  const body = await readBody(event);
  const result = CreateMessageSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, id: true }
  });
  if (!dbUser) throw createError({ statusCode: 404, message: "User not found" });
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    select: { orgId: true }
  });
  if (!ticket) throw createError({ statusCode: 404, message: "Ticket not found" });
  if (ticket.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 403, message: "Forbidden" });
  }
  const message = await prisma.ticketMessage.create({
    data: {
      ticketId: id,
      body: result.data.body,
      // senderType tells us who sent it (agent or AI, not customer for inbound here)
      // (senderType nos dice quién lo envió)
      senderType: result.data.senderType,
      // Link to the agent user if they sent it (Vincular al agente si lo envió)
      ...result.data.senderType === "AGENT" && { senderId: dbUser.id }
    },
    include: {
      sender: { select: { id: true, fullName: true, avatarUrl: true, role: true } }
    }
  });
  const updateData = { updatedAt: /* @__PURE__ */ new Date() };
  if (result.data.senderType === "AGENT") {
    const existingTicket = await prisma.ticket.findUnique({
      where: { id },
      select: { firstResponseAt: true }
    });
    if (existingTicket && !existingTicket.firstResponseAt) {
      updateData.firstResponseAt = /* @__PURE__ */ new Date();
    }
  }
  await prisma.ticket.update({
    where: { id },
    data: updateData
  });
  return { data: message };
});

export { messages_post as default };
//# sourceMappingURL=messages.post.mjs.map
