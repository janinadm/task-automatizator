/**
 * Server API: /api/auth/setup (POST)
 * 
 * PURPOSE: Create the Prisma records (Organization + User) after a new Supabase signup.
 * This is called from signup.vue and confirm.vue after the Supabase auth account exists.
 * 
 * WHY A SERVER ROUTE?
 * We use the service role key here (not the anon key). The service role key has full
 * database access and bypasses Supabase RLS policies. It should NEVER be exposed to
 * the browser (frontend). Nitro server routes run on the server only — safe.
 * 
 * IDEMPOTENT DESIGN: This route is safe to call multiple times. If the user already
 * has records (e.g., from a previous partial signup), we return the existing data.
 * This prevents duplicate organization creation on retry.
 * 
 * (PROPÓSITO: Crear registros Prisma (Organization + User) después de un nuevo registro.
 *  Esto se llama desde signup.vue y confirm.vue después de que existe la cuenta de auth.
 *  
 *  ¿POR QUÉ UNA RUTA DE SERVIDOR?
 *  Usamos la clave de rol de servicio aquí. Tiene acceso completo a la BD y evita las
 *  políticas RLS de Supabase. NUNCA debe exponerse al navegador.
 *  Las rutas de Nitro corren solo en el servidor — seguro.
 *  
 *  DISEÑO IDEMPOTENTE: Seguro de llamar múltiples veces. Si el usuario ya tiene registros,
 *  devolvemos los datos existentes. Esto previene organizaciones duplicadas en reintento.)
 */

import { prisma } from '@ata/db'
import { AuthSetupSchema } from '@ata/shared'
import { createClient } from '@supabase/supabase-js'

// defineEventHandler is how you define a Nitro API route handler
// The H3 library provides all request/response utilities
// (defineEventHandler es cómo se define un manejador de ruta API de Nitro)
// (La librería H3 provee todas las utilidades de request/response)
export default defineEventHandler(async (event) => {
  // Read and validate the request body (Leer y validar el cuerpo de la solicitud)
  const body = await readBody(event)

  const result = AuthSetupSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      message: result.error.errors[0].message,
    })
  }

  const { userId, email, fullName, organizationName } = result.data

  // Optional: verify this request comes from the actual Supabase user
  // We use the service role key to look up the user in auth.users
  // (Opcional: verificar que esta solicitud viene del usuario real de Supabase)
  // (Usamos la clave de rol de servicio para buscar al usuario en auth.users)
  const config = useRuntimeConfig()
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (authError || !authUser.user) {
    throw createError({
      statusCode: 401,
      message: 'Invalid user ID. Could not find this Supabase Auth user.',
    })
  }

  try {
    // IDEMPOTENCY: Check if user already has Prisma records
    // (IDEMPOTENCIA: Verificar si el usuario ya tiene registros Prisma)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    })

    if (existingUser) {
      // User already set up — return existing data (safe to call multiple times)
      // (Usuario ya configurado — devolver datos existentes)
      return {
        success: true,
        user: existingUser,
        organization: existingUser.organization,
        isNewUser: false,
      }
    }

    // Generate a URL-safe slug from the organization name:
    // "Stellar Marketing Agency" → "stellar-marketing-agency"
    // This is used in URLs, API paths, and tenant identification
    // (Generar un slug seguro para URL del nombre de organización)
    const slug = organizationName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars (Eliminar caracteres especiales)
      .replace(/\s+/g, '-')          // Spaces to hyphens (Espacios a guiones)
      .replace(/-+/g, '-')           // Multiple hyphens to one (Múltiples guiones a uno)
      .substring(0, 50)              // Max 50 chars (Máximo 50 caracteres)

    // Make slug unique if needed (Hacer slug único si es necesario)
    const existingOrg = await prisma.organization.findUnique({ where: { slug } })
    const finalSlug = existingOrg ? `${slug}-${Date.now()}` : slug

    // --- DATABASE TRANSACTION ---
    // A transaction ensures BOTH records are created or NEITHER is (atomic)
    // If organization creation succeeds but user fails → both are rolled back
    // This prevents orphaned records (orgs without admins or users without orgs)
    // 
    // (Una transacción garantiza que AMBOS registros se crean o NINGUNO (atómico)
    //  Si la org se crea pero el usuario falla → ambos se revierten
    //  Esto previene registros huérfanos)
    const result = await prisma.$transaction(async (tx) => {
      // Create the organization first (so we have its ID for the user)
      // (Crear la organización primero — para tener su ID para el usuario)
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          slug: finalSlug,
          plan: 'FREE', // Everyone starts on Free tier (Todos empiezan en el nivel Gratuito)
        },
      })

      // Create the user linked to this organization
      // Role: ADMIN — the first user of any org is always the admin
      // (Crear el usuario vinculado a esta organización)
      // (Role: ADMIN — el primer usuario de cualquier org siempre es el admin)
      const user = await tx.user.create({
        data: {
          id: userId,           // Supabase Auth UUID — the link between auth and our DB
          email,
          name: fullName,
          role: 'ADMIN',        // Enum value from our Prisma schema
          organizationId: organization.id,
        },
      })

      return { organization, user }
    })

    return {
      success: true,
      user: result.user,
      organization: result.organization,
      isNewUser: true,
    }
  } catch (error: any) {
    // P2002 = Prisma unique constraint violation (e.g., email already exists)
    // (P2002 = Violación de restricción única de Prisma — por ejemplo, email ya existe)
    if (error?.code === 'P2002') {
      throw createError({
        statusCode: 409,
        message: 'An account with this email already exists.',
      })
    }

    console.error('[api/auth/setup] Error:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to set up account. Please try again or contact support.',
    })
  }
})
