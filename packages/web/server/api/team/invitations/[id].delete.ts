/**
 * API Route: DELETE /api/team/invitations/[id]
 *
 * Revoke a pending invitation. Only ADMIN users can revoke.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const invitationId = getRouterParam(event, 'id')
  if (!invitationId) {
    throw createError({ statusCode: 400, message: 'Invitation ID is required' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  if (dbUser.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Only admins can revoke invitations' })
  }

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    select: { id: true, orgId: true, status: true },
  })

  if (!invitation || invitation.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 404, message: 'Invitation not found' })
  }

  if (invitation.status !== 'PENDING') {
    throw createError({ statusCode: 400, message: 'Only pending invitations can be revoked' })
  }

  await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: 'REVOKED' },
  })

  return { data: { success: true } }
})
