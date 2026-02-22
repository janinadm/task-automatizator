/**
 * API Route: POST /api/canned-responses
 *
 * Create a new canned response template.
 * Only ADMIN users can create responses.
 */

import { prisma } from '@ata/db'
import { CreateCannedResponseSchema } from '@ata/shared'

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

  if (dbUser.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Only admins can create canned responses' })
  }

  const body = await readBody(event)
  const result = CreateCannedResponseSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  const { title, body: responseBody, category, shortcut } = result.data

  try {
    const response = await prisma.cannedResponse.create({
      data: {
        title,
        body: responseBody,
        category: category || null,
        shortcut: shortcut || null,
        orgId: dbUser.orgId,
      },
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

    return { data: response }
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'A canned response with this shortcut already exists' })
    }
    console.error('[api/canned-responses] Error:', error)
    throw createError({ statusCode: 500, message: 'Failed to create canned response' })
  }
})
