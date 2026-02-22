/**
 * API Route: GET /api/team
 *
 * Returns all users in the caller's organization.
 * Includes ticket counts for each user.
 * Only accessible by authenticated org members.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  const { orgId } = dbUser

  const members = await prisma.user.findMany({
    where: { orgId },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: {
          assignedTickets: true,
        },
      },
    },
  })

  // Get resolved count per user
  const resolvedCounts = await prisma.ticket.groupBy({
    by: ['assignedToId'],
    where: {
      orgId,
      status: { in: ['RESOLVED', 'CLOSED'] },
      assignedToId: { not: null },
    },
    _count: { assignedToId: true },
  })

  const resolvedMap = new Map(
    resolvedCounts.filter((r) => r.assignedToId).map((r) => [r.assignedToId!, r._count.assignedToId])
  )

  const team = members.map((m) => ({
    id: m.id,
    email: m.email,
    fullName: m.fullName,
    role: m.role,
    avatarUrl: m.avatarUrl,
    isActive: m.isActive,
    createdAt: m.createdAt,
    assignedTickets: m._count.assignedTickets,
    resolvedTickets: resolvedMap.get(m.id) ?? 0,
  }))

  return {
    data: {
      team,
      totalMembers: team.length,
      currentUserRole: dbUser.role,
    },
  }
})
