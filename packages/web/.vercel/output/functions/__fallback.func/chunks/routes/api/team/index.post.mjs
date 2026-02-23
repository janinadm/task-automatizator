import { d as defineEventHandler, c as createError, r as readBody, b as getRequestURL } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import { randomBytes } from 'crypto';
import { c as CreateInvitationSchema } from '../../../_/index.mjs';
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
    select: { orgId: true, role: true, fullName: true, org: { select: { name: true } } }
  });
  if (!dbUser) {
    throw createError({ statusCode: 404, message: "User profile not found" });
  }
  if (dbUser.role !== "ADMIN") {
    throw createError({ statusCode: 403, message: "Only admins can send invitations" });
  }
  const body = await readBody(event);
  const result = CreateInvitationSchema.safeParse(body);
  if (!result.success) {
    throw createError({ statusCode: 400, message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error" });
  }
  const { email, role } = result.data;
  const existingUser = await prisma.user.findFirst({
    where: { email, orgId: dbUser.orgId }
  });
  if (existingUser) {
    throw createError({ statusCode: 409, message: "This person is already a member of your organization" });
  }
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      email,
      orgId: dbUser.orgId,
      status: "PENDING",
      expiresAt: { gt: /* @__PURE__ */ new Date() }
    }
  });
  if (existingInvite) {
    throw createError({ statusCode: 409, message: "An active invitation already exists for this email" });
  }
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
  const invitation = await prisma.invitation.upsert({
    where: {
      orgId_email: {
        orgId: dbUser.orgId,
        email
      }
    },
    update: {
      role,
      status: "PENDING",
      token,
      expiresAt,
      invitedById: authUser.id
    },
    create: {
      email,
      role,
      token,
      expiresAt,
      invitedById: authUser.id,
      orgId: dbUser.orgId
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      token: true,
      expiresAt: true,
      createdAt: true
    }
  });
  const baseUrl = getRequestURL(event).origin;
  const inviteUrl = `${baseUrl}/signup?invite=${invitation.token}`;
  return {
    data: {
      ...invitation,
      inviteUrl,
      orgName: dbUser.org.name,
      invitedBy: dbUser.fullName
    }
  };
});

export { index_post as default };
//# sourceMappingURL=index.post.mjs.map
