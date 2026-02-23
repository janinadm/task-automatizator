import { d as defineEventHandler, c as createError, a as getRouterParam, r as readBody } from '../../../nitro/nitro.mjs';
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

const _id__patch = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const memberId = getRouterParam(event, "id");
  if (!memberId) {
    throw createError({ statusCode: 400, message: "Member ID is required" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  if (dbUser.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Only admins can modify team members" });
  }
  const targetUser = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true, orgId: true, role: true }
  });
  if (!targetUser || targetUser.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 404, message: "Team member not found" });
  }
  const body = await readBody(event);
  const updates = {};
  if (body.role && ["ADMIN", "AGENT"].includes(body.role)) {
    if (memberId === authUser.id && body.role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { orgId: dbUser.orgId, role: "ADMIN" }
      });
      if (adminCount <= 1) {
        throw createError({ statusCode: 400, message: "Cannot demote the last admin" });
      }
    }
    updates.role = body.role;
  }
  if (typeof body.isActive === "boolean") {
    if (memberId === authUser.id && !body.isActive) {
      throw createError({ statusCode: 400, message: "Cannot deactivate yourself" });
    }
    updates.isActive = body.isActive;
  }
  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: "No valid updates provided" });
  }
  const updated = await prisma.user.update({
    where: { id: memberId },
    data: updates,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true
    }
  });
  return { data: updated };
});

export { _id__patch as default };
//# sourceMappingURL=_id_.patch.mjs.map
