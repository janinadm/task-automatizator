import { d as defineEventHandler, c as createError } from '../../nitro/nitro.mjs';
import { p as prisma } from '../../_/client.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const index_get = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  const responses = await prisma.cannedResponse.findMany({
    where: { orgId: dbUser.orgId },
    orderBy: [{ usageCount: "desc" }, { title: "asc" }],
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
  return { data: responses };
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
