import { d as defineEventHandler, c as createError } from '../../../nitro/nitro.mjs';
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

const me_get = defineEventHandler(async (event) => {
  const authUser = event.context.user;
  if (!authUser) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized. Please log in."
    });
  }
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      org: {
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          logoUrl: true
        }
      }
    }
  });
  if (!user) {
    throw createError({
      statusCode: 404,
      message: "User profile not found. Please complete account setup."
    });
  }
  return {
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      // schema field is 'fullName' (not 'name')
      avatarUrl: user.avatarUrl,
      role: user.role,
      orgId: user.orgId,
      // schema field is 'orgId' (not 'organizationId')
      organization: user.org,
      // remap Prisma's 'org' relation to 'organization' for the API
      createdAt: user.createdAt
    }
  };
});

export { me_get as default };
//# sourceMappingURL=me.get.mjs.map
