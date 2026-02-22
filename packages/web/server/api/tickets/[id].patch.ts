/**
 * API Route: PATCH /api/tickets/[id]
 *
 * Partially updates a ticket. Agents can update:
 * - status (e.g., OPEN → IN_PROGRESS → RESOLVED)
 * - priority
 * - assignedAgentId (reassign)
 * - title, customerName, customerEmail (admin only)
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
    throw createError({ statusCode: 400, message: result.error.errors[0].message })
  }

  // Fetch caller's org (Obtener organzation del usuario)
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { organizationId: true, role: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  // Verify ticket belongs to the caller's org (Verificar que el ticket pertenece a la org)
  const existing = await prisma.ticket.findUnique({
    where: { id },
    select: { organizationId: true, status: true },
  })
  if (!existing) throw createError({ statusCode: 404, message: 'Ticket not found' })
  if (existing.organizationId !== dbUser.organizationId) {
    throw createError({ statusCode: 403, message: 'Forbidden' })
  }

  // Only admins can change title / customer info
  // (Solo los admins pueden cambiar el título / info del cliente)
  const { title, customerName, customerEmail, ...agentFields } = result.data
  const updateData = dbUser.role === 'ADMIN'
    ? result.data
    : agentFields // Agents get a restricted subset (Los agentes obtienen un subconjunto restringido)

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
      assignedAgent: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { messages: true, aiSuggestions: true } },
    },
  })

  return { data: updated }
})
