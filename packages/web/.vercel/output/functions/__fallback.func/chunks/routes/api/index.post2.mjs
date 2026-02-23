import { d as defineEventHandler, c as createError, r as readBody, b as getRequestURL } from '../../nitro/nitro.mjs';
import { p as prisma } from '../../_/client.mjs';
import { randomBytes } from 'crypto';
import { b as CreateIntegrationSchema } from '../../_/index.mjs';
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

const index_post = defineEventHandler(async (event) => {
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
  if (dbUser.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Only admins can create integrations" });
  }
  const body = await readBody(event);
  const result = CreateIntegrationSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const { type, name, config } = result.data;
  const webhookToken = randomBytes(24).toString("base64url");
  const webhookUrl = `/api/webhooks/inbound/${webhookToken}`;
  try {
    const integration = await prisma.integration.create({
      data: {
        type,
        name,
        config: config != null ? config : {},
        webhookUrl,
        orgId: dbUser.orgId
      },
      select: {
        id: true,
        type: true,
        name: true,
        isActive: true,
        webhookUrl: true,
        createdAt: true
      }
    });
    const baseUrl = getRequestURL(event).origin;
    const fullWebhookUrl = `${baseUrl}${integration.webhookUrl}`;
    return {
      data: {
        ...integration,
        fullWebhookUrl
      }
    };
  } catch (error) {
    if ((error == null ? void 0 : error.code) === "P2002") {
      throw createError({ statusCode: 409, message: "An integration with this name and type already exists" });
    }
    console.error("[api/integrations] Error:", error);
    throw createError({ statusCode: 500, message: "Failed to create integration" });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post2.mjs.map
