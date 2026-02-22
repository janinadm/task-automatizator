/**
 * API Route: GET /api/canned-responses
 *
 * List all canned responses for the user's organization.
 * Sorted by usage count (most used first), then by title.
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

  const responses = await prisma.cannedResponse.findMany({
    where: { orgId: dbUser.orgId },
    orderBy: [{ usageCount: 'desc' }, { title: 'asc' }],
    select: {
      id: true,
      title: true,
      body: true,
      category: true,
      shortcut: true,
      isActive: true,
      usageCount: true,
      createdAt: true,
    },
  })

  return { data: responses }
})
