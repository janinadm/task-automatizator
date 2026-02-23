import { d as defineEventHandler, c as createError, r as readBody } from '../../nitro/nitro.mjs';
import { p as prisma } from '../../_/client.mjs';
import { C as CreateCannedResponseSchema } from '../../_/index.mjs';
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
    throw createError({ statusCode: 403, message: "Only admins can create canned responses" });
  }
  const body = await readBody(event);
  const result = CreateCannedResponseSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const { title, body: responseBody, category, shortcut } = result.data;
  try {
    const response = await prisma.cannedResponse.create({
      data: {
        title,
        body: responseBody,
        category: category || null,
        shortcut: shortcut || null,
        orgId: dbUser.orgId
      },
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        shortcut: true,
        isActive: true,
        usageCount: true,
        createdAt: true
      }
    });
    return { data: response };
  } catch (error) {
    if ((error == null ? void 0 : error.code) === "P2002") {
      throw createError({ statusCode: 409, message: "A canned response with this shortcut already exists" });
    }
    console.error("[api/canned-responses] Error:", error);
    throw createError({ statusCode: 500, message: "Failed to create canned response" });
  }
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
