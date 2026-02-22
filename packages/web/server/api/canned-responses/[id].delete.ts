/**
 * API Route: DELETE /api/canned-responses/:id
 *
 * Delete a canned response. Admin only.
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

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  if (dbUser.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Only admins can delete canned responses' })
  }

  try {
    await prisma.cannedResponse.delete({
      where: { id: responseId },
    })

    return { success: true }
  } catch (error: any) {
    if (error?.code === 'P2025') {
      throw createError({ statusCode: 404, message: 'Canned response not found' })
    }
    throw createError({ statusCode: 500, message: 'Failed to delete canned response' })
  }
})
