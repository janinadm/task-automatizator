/**
 * API Route: GET /api/integrations
 *
 * Returns all integrations for the caller's organization.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  const integrations = await prisma.integration.findMany({
    where: { orgId: dbUser.orgId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      name: true,
      isActive: true,
      webhookUrl: true,
      lastSyncAt: true,
      createdAt: true,
      updatedAt: true,
      // Note: we exclude 'config' from listing for security
    },
  })

  return { data: integrations }
})
