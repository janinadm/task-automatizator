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

const _id__use_post = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const responseId = getRouterParam(event, "id");
  if (!responseId) {
    throw createError({ statusCode: 400, message: "Response ID is required" });
  }
  try {
    await prisma.cannedResponse.update({
      where: { id: responseId },
      data: { usageCount: { increment: 1 } }
    });
    return { success: true };
  } catch (error) {
    if ((error == null ? void 0 : error.code) === "P2025") {
      throw createError({ statusCode: 404, message: "Canned response not found" });
    }
    throw createError({ statusCode: 500, message: "Failed to track usage" });
  }
});

export { _id__use_post as default };
//# sourceMappingURL=_id_.use.post.mjs.map
