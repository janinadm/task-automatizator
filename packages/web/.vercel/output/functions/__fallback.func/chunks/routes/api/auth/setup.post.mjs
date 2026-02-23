import { d as defineEventHandler, r as readBody, c as createError, u as useRuntimeConfig } from '../../../nitro/nitro.mjs';
import { p as prisma } from '../../../_/client.mjs';
import { createClient } from '@supabase/supabase-js';
import { A as AuthSetupSchema } from '../../../_/index.mjs';
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

const setup_post = defineEventHandler(async (event) => {
  var _a, _b;
  const body = await readBody(event);
  const result = AuthSetupSchema.safeParse(body);
  if (!result.success) {
    throw createError({
      statusCode: 400,
      // Zod returns an array of errors — we show the first one
      // errors[0] could be undefined if the array is empty (defensive coding!)
      // (Zod retorna un array de errores — mostramos el primero;
      //  errors[0] puede ser undefined si el array está vacío — programación defensiva)
      message: (_b = (_a = result.error.errors[0]) == null ? void 0 : _a.message) != null ? _b : "Validation error"
    });
  }
  const { userId, email, fullName, organizationName } = result.data;
  const config = useRuntimeConfig();
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (authError || !authUser.user) {
    throw createError({
      statusCode: 401,
      message: "Invalid user ID. Could not find this Supabase Auth user."
    });
  }
  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { org: true }
      // 'org' is the relation name in the Prisma schema
    });
    if (existingUser) {
      return {
        success: true,
        user: existingUser,
        organization: existingUser.org,
        // remap to 'organization' for the API response
        isNewUser: false
      };
    }
    const slug = organizationName.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").substring(0, 50);
    const existingOrg = await prisma.organization.findUnique({ where: { slug } });
    const finalSlug = existingOrg ? `${slug}-${Date.now()}` : slug;
    const result2 = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: finalSlug,
          plan: "FREE"
          // Everyone starts on Free tier (Todos empiezan en el nivel Gratuito)
        }
      });
      const user = await tx.user.create({
        data: {
          id: userId,
          // Supabase Auth UUID — the link between auth and our DB
          email,
          fullName,
          // schema field is 'fullName' (not 'name')
          role: "ADMIN",
          // Enum value from our Prisma schema
          orgId: organization.id
          // schema field is 'orgId' (not 'organizationId')
        }
      });
      return { organization, user };
    });
    return {
      success: true,
      user: result2.user,
      organization: result2.organization,
      isNewUser: true
    };
  } catch (error) {
    if ((error == null ? void 0 : error.code) === "P2002") {
      throw createError({
        statusCode: 409,
        message: "An account with this email already exists."
      });
    }
    console.error("[api/auth/setup] Error:", error);
    throw createError({
      statusCode: 500,
      message: "Failed to set up account. Please try again or contact support."
    });
  }
});

export { setup_post as default };
//# sourceMappingURL=setup.post.mjs.map
