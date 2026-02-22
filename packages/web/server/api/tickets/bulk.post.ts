/**
 * API Route: POST /api/tickets/bulk
 *
 * Perform bulk actions on multiple tickets at once.
 * Supports: updateStatus, updatePriority, assign, unassign.
 */

import { prisma } from '@ata/db'
import { BulkTicketActionSchema } from '@ata/shared'

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

  const body = await readBody(event)
  const result = BulkTicketActionSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  const { ticketIds, action, value } = result.data

  // Verify all tickets belong to the user's org
  const ticketCount = await prisma.ticket.count({
    where: {
      id: { in: ticketIds },
      orgId: dbUser.orgId,
    },
  })

  if (ticketCount !== ticketIds.length) {
    throw createError({ statusCode: 403, message: 'Some tickets do not belong to your organization' })
  }

  // Build the update data based on action type
  let updateData: Record<string, any> = {}

  switch (action) {
    case 'updateStatus':
      if (!value || !['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(value)) {
        throw createError({ statusCode: 400, message: 'Invalid status value' })
      }
      updateData = {
        status: value,
        ...(value === 'RESOLVED' ? { resolvedAt: new Date() } : {}),
      }
      break

    case 'updatePriority':
      if (!value || !['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(value)) {
        throw createError({ statusCode: 400, message: 'Invalid priority value' })
      }
      updateData = { priority: value }
      break

    case 'assign':
      if (!value) {
        throw createError({ statusCode: 400, message: 'Agent ID is required for assignment' })
      }
      // Verify agent exists in the same org
      const agent = await prisma.user.findFirst({
        where: { id: value, orgId: dbUser.orgId, isActive: true },
      })
      if (!agent) {
        throw createError({ statusCode: 404, message: 'Agent not found in your organization' })
      }
      updateData = { assignedToId: value, status: 'IN_PROGRESS' }
      break

    case 'unassign':
      updateData = { assignedToId: null }
      break

    default:
      throw createError({ statusCode: 400, message: 'Invalid action' })
  }

  // Execute bulk update
  const updated = await prisma.ticket.updateMany({
    where: {
      id: { in: ticketIds },
      orgId: dbUser.orgId,
    },
    data: updateData,
  })

  return {
    data: {
      updatedCount: updated.count,
      action,
      value: value ?? null,
    },
  }
})
