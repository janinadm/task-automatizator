/**
 * API Route: GET /api/tickets/sla-status
 *
 * Get SLA status for all open/in-progress tickets.
 * Returns breach status, time remaining, and SLA config per priority.
 */

import { prisma } from '@ata/db'

interface SlaStatus {
  ticketId: string
  subject: string
  priority: string
  status: string
  createdAt: string
  firstResponseAt: string | null
  maxResponseMinutes: number | null
  minutesElapsed: number
  minutesRemaining: number | null
  isBreached: boolean
  breachSeverity: 'none' | 'warning' | 'breached' | 'critical'
}

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

  // Get SLA configs for this org
  const slaConfigs = await prisma.slaConfig.findMany({
    where: { orgId: dbUser.orgId },
  })

  const slaMap = new Map(slaConfigs.map((s) => [s.priority, s.maxResponseMinutes]))

  // Get active tickets
  const tickets = await prisma.ticket.findMany({
    where: {
      orgId: dbUser.orgId,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
    select: {
      id: true,
      subject: true,
      priority: true,
      status: true,
      createdAt: true,
      firstResponseAt: true,
      assignedTo: { select: { fullName: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const now = new Date()
  const slaStatuses: SlaStatus[] = tickets.map((ticket) => {
    const maxMinutes = slaMap.get(ticket.priority) ?? null
    const minutesElapsed = Math.floor((now.getTime() - ticket.createdAt.getTime()) / 60000)
    const isResponded = !!ticket.firstResponseAt

    let minutesRemaining: number | null = null
    let isBreached = false
    let breachSeverity: SlaStatus['breachSeverity'] = 'none'

    if (maxMinutes !== null && !isResponded) {
      minutesRemaining = maxMinutes - minutesElapsed
      isBreached = minutesRemaining <= 0

      if (isBreached) {
        // How badly breached: >2x = critical
        breachSeverity = minutesRemaining < -(maxMinutes) ? 'critical' : 'breached'
      } else if (minutesRemaining <= maxMinutes * 0.25) {
        // Less than 25% time remaining = warning
        breachSeverity = 'warning'
      }
    }

    return {
      ticketId: ticket.id,
      subject: ticket.subject,
      priority: ticket.priority,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
      firstResponseAt: ticket.firstResponseAt?.toISOString() ?? null,
      maxResponseMinutes: maxMinutes,
      minutesElapsed,
      minutesRemaining,
      isBreached,
      breachSeverity,
      assignedTo: ticket.assignedTo?.fullName ?? null,
    }
  })

  // Summary stats
  const breachedCount = slaStatuses.filter((s) => s.isBreached).length
  const warningCount = slaStatuses.filter((s) => s.breachSeverity === 'warning').length
  const healthyCount = slaStatuses.filter((s) => s.breachSeverity === 'none').length

  return {
    data: {
      statuses: slaStatuses,
      summary: {
        total: slaStatuses.length,
        breached: breachedCount,
        warning: warningCount,
        healthy: healthyCount,
      },
    },
  }
})
