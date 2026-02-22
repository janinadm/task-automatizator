/**
 * API Route: GET /api/notifications
 *
 * Returns recent notifications for the current user's org.
 * Notifications are derived from recent ticket activity:
 * - New tickets
 * - Status changes
 * - AI suggestions ready
 * - SLA breaches
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

  const { orgId } = dbUser

  // Get the last 24 hours of activity
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [recentTickets, recentMessages, slaBreach, aiSuggestions] = await Promise.all([
    // New tickets created recently
    prisma.ticket.findMany({
      where: { orgId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        id: true,
        subject: true,
        priority: true,
        channel: true,
        customerName: true,
        createdAt: true,
      },
    }),

    // Recent customer messages (not agent/AI)
    prisma.ticketMessage.findMany({
      where: {
        ticket: { orgId },
        senderType: 'CUSTOMER',
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        body: true,
        senderName: true,
        createdAt: true,
        ticket: { select: { id: true, subject: true } },
      },
    }),

    // SLA breaching tickets
    prisma.ticket.findMany({
      where: {
        orgId,
        status: { in: ['OPEN', 'IN_PROGRESS'] },
        priority: 'URGENT',
        createdAt: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
      },
      take: 5,
      select: {
        id: true,
        subject: true,
        createdAt: true,
      },
    }),

    // Recent AI suggestions
    prisma.aiSuggestion.findMany({
      where: {
        ticket: { orgId },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        ticket: { select: { id: true, subject: true } },
      },
    }),
  ])

  // Build unified notification list
  type Notification = {
    id: string
    type: 'new_ticket' | 'customer_message' | 'sla_breach' | 'ai_suggestion'
    title: string
    description: string
    ticketId: string | null
    createdAt: Date
    priority?: string
  }

  const notifications: Notification[] = []

  for (const t of recentTickets) {
    notifications.push({
      id: `ticket-${t.id}`,
      type: 'new_ticket',
      title: 'New ticket',
      description: t.subject.length > 60 ? t.subject.substring(0, 60) + '...' : t.subject,
      ticketId: t.id,
      createdAt: t.createdAt,
      priority: t.priority,
    })
  }

  for (const m of recentMessages) {
    notifications.push({
      id: `msg-${m.id}`,
      type: 'customer_message',
      title: `Reply from ${m.senderName || 'Customer'}`,
      description: m.ticket.subject.length > 60 ? m.ticket.subject.substring(0, 60) + '...' : m.ticket.subject,
      ticketId: m.ticket.id,
      createdAt: m.createdAt,
    })
  }

  for (const s of slaBreach) {
    notifications.push({
      id: `sla-${s.id}`,
      type: 'sla_breach',
      title: 'SLA Breach Warning',
      description: s.subject.length > 60 ? s.subject.substring(0, 60) + '...' : s.subject,
      ticketId: s.id,
      createdAt: s.createdAt,
      priority: 'URGENT',
    })
  }

  for (const a of aiSuggestions) {
    notifications.push({
      id: `ai-${a.id}`,
      type: 'ai_suggestion',
      title: 'AI suggestion ready',
      description: a.ticket.subject.length > 60 ? a.ticket.subject.substring(0, 60) + '...' : a.ticket.subject,
      ticketId: a.ticket.id,
      createdAt: a.createdAt,
    })
  }

  // Sort by time, most recent first
  notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  return {
    data: {
      notifications: notifications.slice(0, 30),
      unreadCount: notifications.length,
    },
  }
})
