// Knowledge Base — Delete article (admin only)
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })
  if (dbUser.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Article ID required' })

  const article = await prisma.article.findFirst({
    where: { id, orgId: dbUser.orgId },
  })
  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })

  await prisma.article.delete({ where: { id } })

  return { success: true }
})
