// Ticket Tags — Add a tag to a ticket
import { prisma } from '@ata/db'
import { AddTagToTicketSchema } from '@ata/shared'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const ticketId = getRouterParam(event, 'id')
  if (!ticketId) throw createError({ statusCode: 400, message: 'Ticket ID required' })

  const body = await readBody(event)
  const result = AddTagToTicketSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0]?.message || 'Invalid input' })
  }

  // Verify ticket belongs to org
  const ticket = await prisma.ticket.findFirst({
    where: { id: ticketId, orgId: dbUser.orgId },
  })
  if (!ticket) throw createError({ statusCode: 404, message: 'Ticket not found' })

  // Verify tag belongs to org
  const tag = await prisma.tag.findFirst({
    where: { id: result.data.tagId, orgId: dbUser.orgId },
  })
  if (!tag) throw createError({ statusCode: 404, message: 'Tag not found' })

  // Upsert to avoid duplicate errors
  await prisma.ticketTag.upsert({
    where: { ticketId_tagId: { ticketId, tagId: result.data.tagId } },
    update: {},
    create: { ticketId, tagId: result.data.tagId },
  })

  return { success: true }
})
