/**
 * API Route: GET /api/auth/invite?token=xxx
 *
 * Validates an invitation token and returns the invite details.
 * Called from the signup page when ?invite=xxx query param is present.
 * Public endpoint — no auth required.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const token = String(query.token ?? '')

  if (!token) {
    throw createError({ statusCode: 400, message: 'Invitation token is required' })
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
        select: { id: true, name: true, slug: true },
      },
      invitedBy: {
        select: { fullName: true },
      },
    },
  })

  if (!invitation) {
    throw createError({ statusCode: 404, message: 'Invalid or expired invitation' })
  }

  if (invitation.status !== 'PENDING') {
    throw createError({ statusCode: 410, message: `This invitation has been ${invitation.status.toLowerCase()}` })
  }

  if (new Date() > invitation.expiresAt) {
    // Mark as expired
    await prisma.invitation.update({
      where: { token },
      data: { status: 'EXPIRED' },
    })
    throw createError({ statusCode: 410, message: 'This invitation has expired' })
  }

  return {
    data: {
      email: invitation.email,
      role: invitation.role,
      orgName: invitation.org.name,
      invitedBy: invitation.invitedBy.fullName,
    },
  }
})
