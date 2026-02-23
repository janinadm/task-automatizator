import { d as defineEventHandler, c as createError, a as getRouterParam } from '../../../../nitro/nitro.mjs';
import { p as prisma } from '../../../../_/client.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const _id__delete = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }
  const invitationId = getRouterParam(event, "id");
  if (!invitationId) {
    throw createError({ statusCode: 400, message: "Invitation ID is required" });
  }
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  if (dbUser.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Only admins can revoke invitations" });
  }
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, orgId: true, status: true }
  });
  if (!invitation || invitation.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 404, message: "Invitation not found" });
  }
  if (invitation.status !== "PENDING") {
    throw createError({ statusCode: 400, message: "Only pending invitations can be revoked" });
  }
  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED" }
  });
  return { data: { success: true } };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
