/**
 * API Route: GET /api/users/me
 * 
 * Returns the currently authenticated user's data from Prisma (not just Supabase Auth).
 * This includes: name, role, organization, plan — the business-layer user data.
 * 
 * The server/middleware/auth.ts has already validated the session and injected
 * event.context.user before this handler runs.
 * 
 * Used by:
 * - The auth Pinia store to hydrate the current user state on app load
 * - The /confirm page to check if this OAuth user already has Prisma records
 * 
 * (Retorna los datos del usuario autenticado actual desde Prisma (no solo Supabase Auth).
 *  Incluye: nombre, rol, organización, plan — los datos del usuario en la capa de negocio.
 *  El server/middleware/auth.ts ya validó la sesión e inyectó event.context.user.)
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  // event.context.user was set by server/middleware/auth.ts
  // If it's not set, the user is not authenticated
  // (event.context.user fue establecido por server/middleware/auth.ts)
  // (Si no está configurado, el usuario no está autenticado)
  const authUser = event.context.user

  if (!authUser) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized. Please log in.',
    })
  }

  // Fetch the user from Prisma with their organization
  // 'org' is the relation field name in our Prisma schema
  // We rename it to 'organization' in the API response for a cleaner API surface
  // (Obtener el usuario de Prisma con su organización)
  // ('org' es el nombre del campo de relación en nuestro esquema Prisma)
  const user = await prisma.user.findUnique({
    where: { id: authUser.id },
    include: {
      org: {
        select: {
          id: true,
          name: true,
          slug: true,
          plan: true,
          logoUrl: true,
        },
      },
    },
  })

  if (!user) {
    // User exists in Supabase Auth but not in our DB — this shouldn't happen
    // but can occur if setup failed. Return 404 so /confirm can re-run setup.
    // (Usuario existe en Supabase Auth pero no en nuestra BD — no debería ocurrir)
    // (pero puede pasar si el setup falló. Devolver 404 para que /confirm re-ejecute setup.)
    throw createError({
      statusCode: 404,
      message: 'User profile not found. Please complete account setup.',
    })
  }

  // Return the user data (without sensitive fields like password hashes)
  // Prisma doesn't store passwords — Supabase Auth handles that
  // (Devolver los datos del usuario (sin campos sensibles como hashes de contraseña))
  // (Prisma no guarda contraseñas — Supabase Auth maneja eso)
  return {
    data: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,   // schema field is 'fullName' (not 'name')
      avatarUrl: user.avatarUrl,
      role: user.role,
      orgId: user.orgId,         // schema field is 'orgId' (not 'organizationId')
      organization: user.org,    // remap Prisma's 'org' relation to 'organization' for the API
      createdAt: user.createdAt,
    },
  }
})
