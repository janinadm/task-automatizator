/**
 * API Route: POST /api/auth/accept-invite
 *
 * Accepts an invitation: creates the user in the invited org instead of
 * creating a new org. Called from signup.vue when ?invite=xxx is present.
 */

import { prisma } from '@ata/db'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { userId, email, fullName, token } = body

  if (!userId || !email || !fullName || !token) {
    throw createError({ statusCode: 400, message: 'Missing required fields' })
  }

  // Verify Supabase auth user exists
  const config = useRuntimeConfig()
  const supabaseAdmin = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (authError || !authUser.user) {
    throw createError({ statusCode: 401, message: 'Invalid user ID' })
  }

  // Validate invitation token
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { org: true },
  })

  if (!invitation) {
    throw createError({ statusCode: 404, message: 'Invalid invitation' })
  }

  if (invitation.status !== 'PENDING') {
    throw createError({ statusCode: 410, message: 'This invitation is no longer valid' })
  }

  if (new Date() > invitation.expiresAt) {
    await prisma.invitation.update({
      where: { token },
      data: { status: 'EXPIRED' },
    })
    throw createError({ statusCode: 410, message: 'This invitation has expired' })
  }

  // Check invitation email matches (case-insensitive)
  if (invitation.email.toLowerCase() !== email.toLowerCase()) {
    throw createError({ statusCode: 403, message: 'This invitation was sent to a different email address' })
  }

  // Check if user already exists in Prisma
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (existingUser) {
    throw createError({ statusCode: 409, message: 'User account already exists' })
  }

  try {
    // Transaction: create user + mark invitation as accepted
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: userId,
          email: email.toLowerCase(),
          fullName,
          role: invitation.role,
          orgId: invitation.orgId,
        },
      })

      await tx.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED' },
      })

      return { user }
    })

    return {
      success: true,
      user: result.user,
      organization: invitation.org,
      isNewUser: true,
    }
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'An account with this email already exists' })
    }
    console.error('[api/auth/accept-invite] Error:', error)
    throw createError({ statusCode: 500, message: 'Failed to accept invitation' })
  }
})
