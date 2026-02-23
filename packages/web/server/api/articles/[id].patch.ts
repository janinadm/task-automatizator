// Knowledge Base — Update article (admin only)
import { prisma } from '@ata/db'
import { UpdateArticleSchema } from '@ata/shared'

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

  const body = await readBody(event)
  const result = UpdateArticleSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0]?.message || 'Invalid input' })
  }

  // Verify article belongs to org
  const existing = await prisma.article.findFirst({
    where: { id, orgId: dbUser.orgId },
  })
  if (!existing) throw createError({ statusCode: 404, message: 'Article not found' })

  const updates: any = { ...result.data }

  // Regenerate slug if title changed
  if (updates.title && updates.title !== existing.title) {
    const baseSlug = updates.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)

    let slug = baseSlug
    let counter = 0
    while (true) {
      const collision = await prisma.article.findUnique({
        where: { orgId_slug: { orgId: dbUser.orgId, slug } },
      })
      if (!collision || collision.id === id) break
      counter++
      slug = `${baseSlug}-${counter}`
    }
    updates.slug = slug
  }

  const updated = await prisma.article.update({
    where: { id },
    data: updates,
  })

  return { data: updated }
})
