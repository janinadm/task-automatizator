import { d as defineEventHandler, c as createError, a as getRouterParam, r as readBody } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import { a as UpdateIntegrationSchema } from '../../../_/index.mjs';
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
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const integrationId = getRouterParam(event, "id");
  if (!integrationId) {
    throw createError({ statusCode: 400, message: "Integration ID is required" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  if (dbUser.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Only admins can update integrations" });
  }
  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { id: true, orgId: true }
  });
  if (!integration || integration.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 404, message: "Integration not found" });
  }
  const body = await readBody(event);
  const result = UpdateIntegrationSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const updates = result.data;
  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: "No valid updates provided" });
  }
  const updated = await prisma.integration.update({
    where: { id: integrationId },
    data: updates,
    select: {
      id: true,
      type: true,
      name: true,
      isActive: true,
      webhookUrl: true,
      lastSyncAt: true,
      updatedAt: true
    }
  });
  return { data: updated };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
