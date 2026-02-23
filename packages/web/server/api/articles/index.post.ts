// Knowledge Base — Create article (admin only)
import { prisma } from '@ata/db'
import { CreateArticleSchema } from '@ata/shared'

export default defineEventHandler(async (event) => {
  const authUser = event.context.user
  if (!authUser) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { orgId: true, role: true },
  })
  if (!dbUser) throw createError({ statusCode: 404, message: 'User not found' })
  if (dbUser.role !== 'ADMIN') throw createError({ statusCode: 403, message: 'Admin only' })

  const body = await readBody(event)
  const result = CreateArticleSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0]?.message || 'Invalid input' })
  }

  const { title, body: articleBody, category, status } = result.data

  // Generate slug from title
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)

  // Check for slug collision
  let slug = baseSlug
  let counter = 0
  while (true) {
    const existing = await prisma.article.findUnique({
      where: { orgId_slug: { orgId: dbUser.orgId, slug } },
    })
    if (!existing) break
    counter++
    slug = `${baseSlug}-${counter}`
  }

  const article = await prisma.article.create({
    data: {
      title,
      slug,
      body: articleBody,
      category: category || null,
      status,
      authorId: authUser.id,
      orgId: dbUser.orgId,
    },
  })

  return { data: article }
})
