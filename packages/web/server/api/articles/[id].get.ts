// Knowledge Base — Get single article
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Article ID required' })

  const article = await prisma.article.findFirst({
    where: { id, orgId: dbUser.orgId },
  })

  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })

  // Increment view count
  await prisma.article.update({
    where: { id },
    data: { views: { increment: 1 } },
  })

  return { data: article }
})
