import { d as defineEventHandler, r as readBody, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import { createClient } from '@supabase/supabase-js';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/ssr';
import '@prisma/client';

const acceptInvite_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, email, fullName, token } = body;
  if (!userId || !email || !fullName || !token) {
    throw createError({ statusCode: 400, message: "Missing required fields" });
  }
  const config = useRuntimeConfig();
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authError || !authUser.user) {
    throw createError({ statusCode: 401, message: "Invalid user ID" });
  }
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { org: true }
  });
  if (!invitation) {
    throw createError({ statusCode: 404, message: "Invalid invitation" });
  }
  if (invitation.status !== "PENDING") {
    throw createError({ statusCode: 410, message: "This invitation is no longer valid" });
  }
  if (/* @__PURE__ */ new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { token },
      data: { status: "EXPIRED" }
    });
    throw createError({ statusCode: 410, message: "This invitation has expired" });
  }
  if (invitation.email.toLowerCase() !== email.toLowerCase()) {
    throw createError({ statusCode: 403, message: "This invitation was sent to a different email address" });
  }
  const existingUser = await prisma.user.findUnique({
    where: { id: userId }
  });
  if (existingUser) {
    throw createError({ statusCode: 409, message: "User account already exists" });
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          email: email.toLowerCase(),
          fullName,
          role: invitation.role,
          orgId: invitation.orgId
        }
      });
      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" }
      });
      return { user };
    });
    return {
      success: true,
      user: result.user,
      organization: invitation.org,
      isNewUser: true
    };
  } catch (error) {
    if ((error == null ? void 0 : error.code) === "P2002") {
      throw createError({ statusCode: 409, message: "An account with this email already exists" });
    }
    console.error("[api/auth/accept-invite] Error:", error);
    throw createError({ statusCode: 500, message: "Failed to accept invitation" });
  }
});

export { acceptInvite_post as default };
//# sourceMappingURL=accept-invite.post.mjs.map
