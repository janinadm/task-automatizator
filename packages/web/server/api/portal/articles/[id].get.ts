// Customer Portal — Read single article by slug or id (public, no auth)
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Article ID required' })

  const query = getQuery(event)
  const orgSlug = query.org as string | undefined
  if (!orgSlug) throw createError({ statusCode: 400, message: 'Organization slug required' })

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true },
  })
  if (!org) throw createError({ statusCode: 404, message: 'Organization not found' })

  const article = await prisma.article.findFirst({
    where: {
      id,
      orgId: org.id,
      status: 'PUBLISHED',
    },
    select: {
      id: true,
      title: true,
      slug: true,
      body: true,
      category: true,
      views: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!article) throw createError({ statusCode: 404, message: 'Article not found' })

  // Increment views
  await prisma.article.update({
    where: { id },
    data: { views: { increment: 1 } },
  })

  return { data: article }
})
