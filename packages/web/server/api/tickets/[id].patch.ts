/**
 * API Route: PATCH /api/tickets/[id]
 *
 * Partially updates a ticket. Agents can update:
 * - status (e.g., OPEN → IN_PROGRESS → RESOLVED)
 * - priority
 * - assignedToId (reassign)
 * - category
 *
 * Uses Prisma's UPDATE + returns the full updated ticket.
 *
 * WHY PATCH NOT PUT?
 * PUT = replace the entire resource (send all fields)
 * PATCH = update only the fields you send (partial update)
 * PATCH is better for UX: you only send what changed.
 *
 * (¿POR QUÉ PATCH EN VEZ DE PUT?
 *  PUT = reemplazar el recurso completo (enviar todos los campos)
 *  PATCH = actualizar solo los campos que envíes (actualización parcial)
 *  PATCH es mejor para UX: solo envías lo que cambió.)
 */

import { prisma } from '@ata/db'
import { UpdateTicketSchema } from '@ata/shared'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Missing ticket ID' })

  const body = await readBody(event)
  const result = UpdateTicketSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.errors[0]?.message ?? 'Validation error' })
  }

  // Fetch caller's org (Obtener organización del usuario)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  // Verify ticket belongs to the caller's org (Verificar que el ticket pertenece a la org)
  const existing = await prisma.ticket.findUnique({
    where: { id },
    select: { orgId: true, status: true },
  })
  if (!existing) throw createError({ statusCode: 404, message: 'Ticket not found' })
  if (existing.orgId !== dbUser.orgId) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // UpdateTicketSchema only allows: status, priority, assignedToId, category
  // Admins get all fields; agents get same set (schema already limits scope)
  // (UpdateTicketSchema solo permite: status, priority, assignedToId, category)
  const updateData = result.data

  const updated = await prisma.ticket.update({
    where: { id },
    data: {
      ...updateData,
      // Auto-set resolvedAt when moving to RESOLVED/CLOSED
      // (Auto-establecer resolvedAt al mover a RESOLVED/CLOSED)
      ...(updateData.status === 'RESOLVED' || updateData.status === 'CLOSED'
        ? { resolvedAt: new Date() }
        : {}),
    },
    include: {
      assignedTo: { select: { id: true, fullName: true, avatarUrl: true } },
      _count: { select: { messages: true, aiSuggestions: true } },
    },
  })

  return { data: updated }
})
