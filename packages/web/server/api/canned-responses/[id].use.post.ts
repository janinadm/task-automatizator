/**
 * API Route: POST /api/canned-responses/:id/use
 *
 * Increment the usage counter for a canned response.
 * Called when an agent uses a canned response in a reply.
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const responseId = getRouterParam(event, 'id')
  if (!responseId) {
    throw createError({ statusCode: 400, message: 'Response ID is required' })
  }

  try {
    await prisma.cannedResponse.update({
      where: { id: responseId },
      data: { usageCount: { increment: 1 } },
    })

    return { success: true }
  } catch (error: any) {
    if (error?.code === 'P2025') {
      throw createError({ statusCode: 404, message: 'Canned response not found' })
    }
    throw createError({ statusCode: 500, message: 'Failed to track usage' })
  }
})
