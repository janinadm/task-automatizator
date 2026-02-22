/**
 * API Route: POST /api/webhooks/inbound/[token]
 *
 * Generic inbound webhook handler. External services (email forwarders,
 * WhatsApp Business API, Slack bots, custom integrations) POST messages here.
 * The token identifies which integration and org this message belongs to.
 *
 * This endpoint is PUBLIC (no auth required) — auth is via the webhook token.
 *
 * Expected payload:
 * {
 *   subject?: string,       // Email subject or message title
 *   body: string,           // Message content
 *   senderName?: string,    // Customer name
 *   senderEmail?: string,   // Customer email
 *   externalId?: string,    // External message/conversation ID for dedup
 * }
 */

import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    throw createError({ statusCode: 400, message: 'Webhook token is required' })
  }

  const webhookUrl = `/api/webhooks/inbound/${token}`

  // Look up the integration by webhook URL
  const integration = await prisma.integration.findUnique({
    where: { webhookUrl },
    select: {
      id: true,
      type: true,
      name: true,
      isActive: true,
      orgId: true,
    },
  })

  if (!integration) {
    throw createError({ statusCode: 404, message: 'Invalid webhook' })
  }

  if (!integration.isActive) {
    throw createError({ statusCode: 403, message: 'This integration is currently disabled' })
  }

  const body = await readBody(event)

  if (!body?.body || typeof body.body !== 'string') {
    throw createError({ statusCode: 400, message: 'Message body is required' })
  }

  // Determine the channel from integration type
  const channelMap: Record<string, string> = {
    EMAIL_IMAP: 'EMAIL',
    EMAIL_SMTP: 'EMAIL',
    WHATSAPP: 'WHATSAPP',
    SLACK: 'SLACK',
    WEBHOOK: 'WEB',
  }

  const channel = channelMap[integration.type] ?? 'WEB'

  try {
    // Create the ticket + first message in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.create({
        data: {
          subject: body.subject || `${integration.name} message`,
          body: body.body,
          channel: channel as any,
          status: 'OPEN',
          priority: 'MEDIUM',
          customerName: body.senderName || null,
          customerEmail: body.senderEmail || null,
          orgId: integration.orgId,
        },
      })

      await tx.ticketMessage.create({
        data: {
          body: body.body,
          senderType: 'CUSTOMER',
          senderName: body.senderName || 'Customer',
          ticketId: ticket.id,
        },
      })

      return ticket
    })

    // Update last sync timestamp
    await prisma.integration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    })

    return {
      success: true,
      ticketId: result.id,
      message: 'Ticket created successfully',
    }
  } catch (error) {
    console.error('[webhook/inbound] Error:', error)
    throw createError({ statusCode: 500, message: 'Failed to process webhook' })
  }
})
