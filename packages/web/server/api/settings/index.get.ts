/**
 * API Route: GET /api/settings
 *
 * Returns org settings: name, plan, SLA configs.
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

  const org = await prisma.organization.findUnique({
    where: { id: dbUser.orgId },
    select: {
      id: true,
      name: true,
      slug: true,
      plan: true,
      autoAssign: true,
      logoUrl: true,
      createdAt: true,
    },
  })

  const slaConfigs = await prisma.slaConfig.findMany({
    where: { orgId: dbUser.orgId },
    orderBy: { priority: 'asc' },
  })

  const memberCount = await prisma.user.count({
    where: { orgId: dbUser.orgId },
  })

  const ticketCount = await prisma.ticket.count({
    where: { orgId: dbUser.orgId },
  })

  return {
    data: {
      organization: org,
      slaConfigs,
      memberCount,
      ticketCount,
      currentUserRole: dbUser.role,
    },
  }
})
