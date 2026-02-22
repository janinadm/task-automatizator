/**
 * API Route: PATCH /api/canned-responses/:id
 *
 * Update a canned response. Admin only.
 */

import { prisma } from '@ata/db'
import { UpdateCannedResponseSchema } from '@ata/shared'

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
    throw createError({ statusCode: 403, message: 'Only admins can edit canned responses' })
  }

  const body = await readBody(event)
  const result = UpdateCannedResponseSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  const updates = result.data

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: 'No valid updates provided' })
  }

  try {
    const updated = await prisma.cannedResponse.update({
      where: { id: responseId },
      data: updates as any,
      select: {
        id: true,
        title: true,
        body: true,
        category: true,
        shortcut: true,
        isActive: true,
        usageCount: true,
        updatedAt: true,
      },
    })

    return { data: updated }
  } catch (error: any) {
    if (error?.code === 'P2025') {
      throw createError({ statusCode: 404, message: 'Canned response not found' })
    }
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'A response with this shortcut already exists' })
    }
    throw createError({ statusCode: 500, message: 'Failed to update canned response' })
  }
})
