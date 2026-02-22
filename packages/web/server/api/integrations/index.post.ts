/**
 * API Route: POST /api/integrations
 *
 * Create a new integration for the organization.
 * Only ADMIN users can create integrations.
 * Auto-generates a webhook URL for inbound message ingestion.
 */

import { prisma } from '@ata/db'
import { CreateIntegrationSchema } from '@ata/shared'
import { randomBytes } from 'crypto'

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
    throw createError({ statusCode: 403, message: 'Only admins can create integrations' })
  }

  const body = await readBody(event)
  const result = CreateIntegrationSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  const { type, name, config } = result.data

  // Generate a unique webhook URL token
  const webhookToken = randomBytes(24).toString('base64url')
  const webhookUrl = `/api/webhooks/inbound/${webhookToken}`

  try {
    const integration = await prisma.integration.create({
      data: {
        type,
        name,
        config: config ?? {},
        webhookUrl,
        orgId: dbUser.orgId,
      },
      select: {
        id: true,
        type: true,
        name: true,
        isActive: true,
        webhookUrl: true,
        createdAt: true,
      },
    })

    // Build the full webhook URL
    const baseUrl = getRequestURL(event).origin
    const fullWebhookUrl = `${baseUrl}${integration.webhookUrl}`

    return {
      data: {
        ...integration,
        fullWebhookUrl,
      },
    }
  } catch (error: any) {
    if (error?.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'An integration with this name and type already exists' })
    }
    console.error('[api/integrations] Error:', error)
    throw createError({ statusCode: 500, message: 'Failed to create integration' })
  }
})
