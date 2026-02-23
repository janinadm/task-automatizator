import { d as defineEventHandler, c as createError, a as getRouterParam, r as readBody } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import { U as UpdateCannedResponseSchema } from '../../../_/index.mjs';
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
  const responseId = getRouterParam(event, "id");
  if (!responseId) {
    throw createError({ statusCode: 400, message: "Response ID is required" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  if (dbUser.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Only admins can edit canned responses" });
  }
  const body = await readBody(event);
  const result = UpdateCannedResponseSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const updates = result.data;
  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: "No valid updates provided" });
  }
  try {
    const updated = await prisma.cannedResponse.update({
      where: { id: responseId },
      data: updates,
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        shortcut: true,
        isActive: true,
        usageCount: true,
        updatedAt: true
      }
    });
    return { data: updated };
  } catch (error) {
    if ((error == null ? void 0 : error.code) === "P2025") {
      throw createError({ statusCode: 404, message: "Canned response not found" });
    }
    if ((error == null ? void 0 : error.code) === "P2002") {
      throw createError({ statusCode: 409, message: "A response with this shortcut already exists" });
    }
    throw createError({ statusCode: 500, message: "Failed to update canned response" });
  }
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
