import { d as defineEventHandler, c as createError, r as readBody } from '../../nitro/nitro.mjs';
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

const index_patch = defineEventHandler(async (event) => {
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
    throw createError({ statusCode: 403, message: "Only admins can update settings" });
  }
  const body = await readBody(event);
  if (body.name && typeof body.name === "string") {
    const name = body.name.trim();
    if (name.length < 2 || name.length > 100) {
      throw createError({ statusCode: 400, message: "Organization name must be 2-100 characters" });
    }
    await prisma.organization.update({
      where: { id: dbUser.orgId },
      data: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      }
    });
  }
  if (typeof body.autoAssign === "boolean") {
    await prisma.organization.update({
      where: { id: dbUser.orgId },
      data: { autoAssign: body.autoAssign }
    });
  }
  if (body.slaConfigs && Array.isArray(body.slaConfigs)) {
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];
    for (const config of body.slaConfigs) {
      if (!validPriorities.includes(config.priority)) continue;
      if (typeof config.maxResponseMinutes !== "number" || config.maxResponseMinutes < 1) continue;
      await prisma.slaConfig.upsert({
        where: {
          orgId_priority: {
            orgId: dbUser.orgId,
            priority: config.priority
          }
        },
        update: { maxResponseMinutes: config.maxResponseMinutes },
        create: {
          orgId: dbUser.orgId,
          priority: config.priority,
          maxResponseMinutes: config.maxResponseMinutes
        }
      });
    }
  }
  return { data: { success: true } };
});

export { index_patch as default };
//# sourceMappingURL=index.patch.mjs.map
