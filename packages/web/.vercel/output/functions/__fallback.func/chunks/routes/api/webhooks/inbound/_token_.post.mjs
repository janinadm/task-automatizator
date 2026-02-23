import { d as defineEventHandler, a as getRouterParam, c as createError, r as readBody } from '../../../../nitro/nitro.mjs';
import { p as prisma } from '../../../../_/client.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const _token__post = defineEventHandler(async (event) => {
  var _a;
  const token = getRouterParam(event, "token");
  if (!token) {
    throw createError({ statusCode: 400, message: "Webhook token is required" });
  }
  const webhookUrl = `/api/webhooks/inbound/${token}`;
  const integration = await prisma.integration.findUnique({
    where: { webhookUrl },
    select: {
      id: true,
      type: true,
      name: true,
      isActive: true,
      orgId: true
    }
  });
  if (!integration) {
    throw createError({ statusCode: 404, message: "Invalid webhook" });
  }
  if (!integration.isActive) {
    throw createError({ statusCode: 403, message: "This integration is currently disabled" });
  }
  const body = await readBody(event);
  if (!(body == null ? void 0 : body.body) || typeof body.body !== "string") {
    throw createError({ statusCode: 400, message: "Message body is required" });
  }
  const channelMap = {
    EMAIL_IMAP: "EMAIL",
    EMAIL_SMTP: "EMAIL",
    WHATSAPP: "WHATSAPP",
    SLACK: "SLACK",
    WEBHOOK: "WEB"
  };
  const channel = (_a = channelMap[integration.type]) != null ? _a : "WEB";
  try {
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          subject: body.subject || `${integration.name} message`,
          body: body.body,
          channel,
          status: "OPEN",
          priority: "MEDIUM",
          customerName: body.senderName || null,
          customerEmail: body.senderEmail || null,
          orgId: integration.orgId
        }
      });
      await tx.ticketMessage.create({
        data: {
          body: body.body,
          senderType: "CUSTOMER",
          senderName: body.senderName || "Customer",
          ticketId: ticket.id
        }
      });
      return ticket;
    });
    await prisma.integration.update({
      where: { id: integration.id },
      data: { lastSyncAt: /* @__PURE__ */ new Date() }
    });
    return {
      success: true,
      ticketId: result.id,
      message: "Ticket created successfully"
    };
  } catch (error) {
    console.error("[webhook/inbound] Error:", error);
    throw createError({ statusCode: 500, message: "Failed to process webhook" });
  }
});

export { _token__post as default };
//# sourceMappingURL=_token_.post.mjs.map
