// Ticket Tags — Remove a tag from a ticket
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const ticketId = getRouterParam(event, 'id')
  const tagId = getRouterParam(event, 'tagId')
  if (!ticketId || !tagId) throw createError({ statusCode: 400, message: 'Ticket ID and Tag ID required' })

  // Verify ticket belongs to org
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, orgId: dbUser.orgId },
  })
  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })

  await prisma.ticketTag.deleteMany({
    where: { ticketId, tagId },
  })

  return { success: true }
})
