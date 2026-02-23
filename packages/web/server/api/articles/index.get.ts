// Knowledge Base — List articles
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const query = getQuery(event)
  const status = query.status as string | undefined
  const category = query.category as string | undefined
  const search = query.search as string | undefined

  const where: any = { orgId: dbUser.orgId }
  if (status) where.status = status
  if (category) where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
    ]
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      status: true,
      views: true,
      authorId: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return { data: articles }
})
