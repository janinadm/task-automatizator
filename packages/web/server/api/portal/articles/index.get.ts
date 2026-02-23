// Knowledge Base — Public articles endpoint (for customer portal)
// No auth required — shows only published articles
import { prisma } from '@ata/db'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orgSlug = query.org as string | undefined
  const search = query.search as string | undefined
  const category = query.category as string | undefined

  if (!orgSlug) {
    throw createError({ statusCode: 400, message: 'Organization slug required' })
  }

  const org = await prisma.organization.findUnique({
    where: { slug: orgSlug },
    select: { id: true, name: true },
  })
  if (!org) throw createError({ statusCode: 404, message: 'Organization not found' })

  const where: any = {
    orgId: org.id,
    status: 'PUBLISHED',
  }
  if (category) where.category = category
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { body: { contains: search, mode: 'insensitive' } },
    ]
  }

  const articles = await prisma.article.findMany({
    where,
    orderBy: { views: 'desc' },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      views: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 100,
  })

  // Get unique categories
  const categories = await prisma.article.findMany({
    where: { orgId: org.id, status: 'PUBLISHED', category: { not: null } },
    select: { category: true },
    distinct: ['category'],
  })

  return {
    data: {
      orgName: org.name,
      articles,
      categories: categories.map((c) => c.category).filter(Boolean),
    },
  }
})
