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
  const integrations = await prisma.integration.findMany({
    where: { orgId: dbUser.orgId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      name: true,
      isActive: true,
      webhookUrl: true,
      lastSyncAt: true,
      createdAt: true,
      updatedAt: true
      // Note: we exclude 'config' from listing for security
    }
  });
  return { data: integrations };
});

export { index_get as default };
//# sourceMappingURL=index.get3.mjs.map
