/**
 * API Route: POST /api/team/invitations
 *
 * Send an invitation to join the organization.
 * Creates a unique token and stores the invitation.
 * Only ADMIN users can invite new members.
 */

import { prisma } from '@ata/db'
import { CreateInvitationSchema } from '@ata/shared'
import { randomBytes } from 'crypto'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true, fullName: true, org: { select: { name: true } } },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  if (dbUser.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Only admins can send invitations' })
  }

  const body = await readBody(event)
  const result = CreateInvitationSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  const { email, role } = result.data

  // Check if user already exists in this org
  const existingUser = await prisma.user.findFirst({
    where: { email, orgId: dbUser.orgId },
  })

  if (existingUser) {
    throw createError({ statusCode: 409, message: 'This person is already a member of your organization' })
  }

  // Check for existing pending invitation
  const existingInvite = await prisma.invitation.findFirst({
    where: {
      email,
      orgId: dbUser.orgId,
      status: 'PENDING',
      expiresAt: { gt: new Date() },
    },
  })

  if (existingInvite) {
    throw createError({ statusCode: 409, message: 'An active invitation already exists for this email' })
  }

  // Generate unique token (URL-safe base64)
  const token = randomBytes(32).toString('base64url')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

  // Upsert: update existing expired/revoked invitation or create new
  const invitation = await prisma.invitation.upsert({
    where: {
      orgId_email: {
        orgId: dbUser.orgId,
        email,
      },
    },
    update: {
      role,
      status: 'PENDING',
      token,
      expiresAt,
      invitedById: authUser.id,
    },
    create: {
      email,
      role,
      token,
      expiresAt,
      invitedById: authUser.id,
      orgId: dbUser.orgId,
    },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      token: true,
      expiresAt: true,
      createdAt: true,
    },
  })

  // Build the invite URL
  const baseUrl = getRequestURL(event).origin
  const inviteUrl = `${baseUrl}/signup?invite=${invitation.token}`

  return {
    data: {
      ...invitation,
      inviteUrl,
      orgName: dbUser.org.name,
      invitedBy: dbUser.fullName,
    },
  }
})
