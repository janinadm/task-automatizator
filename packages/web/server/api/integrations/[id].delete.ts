/**
 * API Route: DELETE /api/integrations/[id]
 *
 * Delete an integration. Only ADMIN users can delete.
 */

import { prisma } from '@ata/db'

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
    throw createError({ statusCode: 403, message: 'Only admins can delete integrations' })
  }

  const integration = await prisma.integration.findUnique({
    where: { id: integrationId },
    select: { id: true, orgId: true },
  })

  if (!integration || integration.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 404, message: 'Integration not found' })
  }

  await prisma.integration.delete({
    where: { id: integrationId },
  })

  return { data: { success: true } }
})
