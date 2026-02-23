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
    select: { orgId: true, role: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  const org = await prisma.organization.findUnique({
    where: { id: dbUser.orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      autoAssign: true,
      logoUrl: true,
      createdAt: true
    }
  });
  const slaConfigs = await prisma.slaConfig.findMany({
    where: { orgId: dbUser.orgId },
    orderBy: { priority: "asc" }
  });
  const memberCount = await prisma.user.count({
    where: { orgId: dbUser.orgId }
  });
  const ticketCount = await prisma.ticket.count({
    where: { orgId: dbUser.orgId }
  });
  return {
    data: {
      organization: org,
      slaConfigs,
      memberCount,
      ticketCount,
      currentUserRole: dbUser.role
    }
  };
});

export { index_get as default };
//# sourceMappingURL=index.get5.mjs.map
