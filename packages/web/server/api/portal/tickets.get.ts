// Customer Portal — Public ticket lookup by email
// Customers can check status of their tickets without logging in
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const email = query.email as string | undefined
  const orgSlug = query.org as string | undefined

  if (!email || !orgSlug) {
    throw createError({ statusCode: 400, message: 'Email and organization slug required' })
  }

  // Find the organization
  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true },
  })
  if (!org) throw createError({ statusCode: 404, message: 'Organization not found' })

  // Fetch customer's tickets (limited info — no internal data exposed)
  const tickets = await prisma.ticket.findMany({
    where: {
      orgId: org.id,
      customerEmail: email,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      subject: true,
      status: true,
      priority: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        where: { isInternal: false }, // Never expose internal notes!
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          body: true,
          senderType: true,
          createdAt: true,
        },
      },
    },
    take: 50,
  })

  return {
    data: {
      orgName: org.name,
      tickets: tickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        lastMessage: t.messages[0] || null,
      })),
    },
  }
})
