// Internal Notes — Create an internal note on a ticket (agents only, not visible to customers)
import { prisma } from '@ata/db'
import { CreateInternalNoteSchema } from '@ata/shared'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, fullName: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, message: 'Ticket ID required' })

  const body = await readBody(event)
  const result = CreateInternalNoteSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0]?.message || 'Invalid input' })
  }

  // Verify ticket belongs to org
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, orgId: dbUser.orgId },
  })
  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })

  const note = await prisma.ticketMessage.create({
    data: {
      body: result.data.body,
      senderType: 'AGENT',
      senderName: dbUser.fullName,
      isInternal: true,
      ticketId,
      senderId: authUser.id,
    },
  })

  return { data: note }
})
