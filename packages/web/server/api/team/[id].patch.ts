/**
 * API Route: PATCH /api/team/[id]
 *
 * Update a team member's role or active status.
 * Only ADMINs can modify other users.
 * Cannot demote yourself if you're the last admin.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const memberId = getRouterParam(event, 'id')
  if (!memberId) {
    throw createError({ statusCode: 400, message: 'Member ID is required' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  // Only admins can modify team members
  if (dbUser.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Only admins can modify team members' })
  }

  // Ensure the target user belongs to the same org
  const targetUser = await prisma.user.findUnique({
    where: { id: memberId },
    select: { id: true, orgId: true, role: true },
  })

  if (!targetUser || targetUser.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 404, message: 'Team member not found' })
  }

  const body = await readBody(event)
  const updates: Record<string, any> = {}

  // Role update
  if (body.role && ['ADMIN', 'AGENT'].includes(body.role)) {
    // If demoting self, ensure at least one admin remains
    if (memberId === authUser.id && body.role !== 'ADMIN') {
      const adminCount = await prisma.user.count({
        where: { orgId: dbUser.orgId, role: 'ADMIN' },
      })
      if (adminCount <= 1) {
        throw createError({ statusCode: 400, message: 'Cannot demote the last admin' })
      }
    }
    updates.role = body.role
  }

  // Active status
  if (typeof body.isActive === 'boolean') {
    // Cannot deactivate yourself
    if (memberId === authUser.id && !body.isActive) {
      throw createError({ statusCode: 400, message: 'Cannot deactivate yourself' })
    }
    updates.isActive = body.isActive
  }

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: 'No valid updates provided' })
  }

  const updated = await prisma.user.update({
    where: { id: memberId },
    data: updates,
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      isActive: true,
    },
  })

  return { data: updated }
})
