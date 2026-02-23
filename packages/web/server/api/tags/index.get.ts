// Tags — List all tags for the organization
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const tags = await prisma.tag.findMany({
    where: { orgId: dbUser.orgId },
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { tickets: true } },
    },
  })

  return {
    data: tags.map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      ticketCount: t._count.tickets,
    })),
  }
})
