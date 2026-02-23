// Tags — Create a new tag (admin only)
import { prisma } from '@ata/db'
import { CreateTagSchema } from '@ata/shared'

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
  const result = CreateTagSchema.safeParse(body)
  if (!result.success) {
    throw createError({ statusCode: 400, message: result.error.issues[0]?.message || 'Invalid input' })
  }

  const { name, color } = result.data

  // Check for duplicate
  const existing = await prisma.tag.findUnique({
    where: { orgId_name: { orgId: dbUser.orgId, name } },
  })
  if (existing) {
    throw createError({ statusCode: 409, message: 'Tag already exists' })
  }

  const tag = await prisma.tag.create({
    data: { name, color, orgId: dbUser.orgId },
  })

  return { data: tag }
})
