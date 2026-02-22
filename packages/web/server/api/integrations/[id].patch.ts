/**
 * API Route: PATCH /api/integrations/[id]
 *
 * Update an integration's name, active status, or config.
 * Only ADMIN users can update integrations.
 */

import { prisma } from '@ata/db'
import { UpdateIntegrationSchema } from '@ata/shared'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) {
    throw createError({ statusCode: 401, message: 'Unauthorized' })
  }

  const integrationId = getRouterParam(event, 'id')
  if (!integrationId) {
    throw createError({ statusCode: 400, message: 'Integration ID is required' })
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })

  if (!dbUser) {
    throw createError({ statusCode: 404, message: 'User profile not found' })
  }

  if (dbUser.role !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Only admins can update integrations' })
  }

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { id: true, orgId: true },
  })

  if (!integration || integration.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 404, message: 'Integration not found' })
  }

  const body = await readBody(event)
  const result = UpdateIntegrationSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  const updates = result.data

  if (Object.keys(updates).length === 0) {
    throw createError({ statusCode: 400, message: 'No valid updates provided' })
  }

  const updated = await prisma.integration.update({
    where: { id: integrationId },
    data: updates,
    select: {
      id: true,
      type: true,
      name: true,
      isActive: true,
      webhookUrl: true,
      lastSyncAt: true,
      updatedAt: true,
    },
  })

  return { data: updated }
})
