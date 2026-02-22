/**
 * API Route: POST /api/tickets/auto-assign
 *
 * Auto-assign unassigned tickets using round-robin strategy.
 * Distributes tickets evenly among active agents.
 * Only works when autoAssign is enabled in the organization settings.
 */

import { prisma } from '@ata/db'

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
    throw createError({ statusCode: 403, message: 'Only admins can trigger auto-assignment' })
  }

  // Check if auto-assign is enabled
  const org = await prisma.organization.findUnique({
    where: { id: dbUser.orgId },
    select: { autoAssign: true },
  })

  if (!org?.autoAssign) {
    throw createError({ statusCode: 400, message: 'Auto-assignment is not enabled for this organization' })
  }

  // Get all active agents in the org, sorted by their current ticket load (ascending)
  const agents = await prisma.user.findMany({
    where: {
      orgId: dbUser.orgId,
      isActive: true,
      role: { in: ['ADMIN', 'AGENT'] },
    },
    select: {
      id: true,
      fullName: true,
      _count: {
        select: {
          assignedTickets: {
            where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          },
        },
      },
    },
    orderBy: {
      assignedTickets: { _count: 'asc' },
    },
  })

  if (agents.length === 0) {
    throw createError({ statusCode: 400, message: 'No active agents available for assignment' })
  }

  // Get unassigned open tickets
  const unassignedTickets = await prisma.ticket.findMany({
    where: {
      orgId: dbUser.orgId,
      assignedToId: null,
      status: { in: ['OPEN', 'IN_PROGRESS'] },
    },
    select: { id: true },
    orderBy: [
      { priority: 'desc' }, // URGENT first
      { createdAt: 'asc' },  // Oldest first
    ],
  })

  if (unassignedTickets.length === 0) {
    return { data: { assignedCount: 0, message: 'No unassigned tickets to assign' } }
  }

  // Round-robin assignment: distribute tickets across agents
  const assignments: { ticketId: string; agentId: string; agentName: string }[] = []

  for (let i = 0; i < unassignedTickets.length; i++) {
    const agent = agents[i % agents.length]!
    assignments.push({
      ticketId: unassignedTickets[i]!.id,
      agentId: agent.id,
      agentName: agent.fullName,
    })
  }

  // Execute all assignments in a transaction
  await prisma.$transaction(
    assignments.map((a) =>
      prisma.ticket.update({
        where: { id: a.ticketId },
        data: {
          assignedToId: a.agentId,
          status: 'IN_PROGRESS',
        },
      })
    )
  )

  return {
    data: {
      assignedCount: assignments.length,
      assignments: assignments.map((a) => ({
        ticketId: a.ticketId,
        agentName: a.agentName,
      })),
    },
  }
})
