import { d as defineEventHandler, g as getQuery, c as createError } from '../../../nitro/nitro.mjs';
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

const invite_get = defineEventHandler(async (event) => {
  var _a;
  const query = getQuery(event);
  const token = String((_a = query.token) != null ? _a : "");
  if (!token) {
    throw createError({ statusCode: 400, message: "Invitation token is required" });
  }
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      expiresAt: true,
      org: {
        select: { id: true, name: true, slug: true }
      },
      invitedBy: {
        select: { fullName: true }
      }
    }
  });
  if (!invitation) {
    throw createError({ statusCode: 404, message: "Invalid or expired invitation" });
  }
  if (invitation.status !== "PENDING") {
    throw createError({ statusCode: 410, message: `This invitation has been ${invitation.status.toLowerCase()}` });
  }
  if (/* @__PURE__ */ new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { token },
      data: { status: "EXPIRED" }
    });
    throw createError({ statusCode: 410, message: "This invitation has expired" });
  }
  return {
    data: {
      email: invitation.email,
      role: invitation.role,
      orgName: invitation.org.name,
      invitedBy: invitation.invitedBy.fullName
    }
  };
});

export { invite_get as default };
//# sourceMappingURL=invite.get.mjs.map
