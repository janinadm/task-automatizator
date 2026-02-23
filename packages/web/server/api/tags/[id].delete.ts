// Tags — Delete a tag (admin only)
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
  if (!id) throw createError({ statusCode: 400, message: 'Tag ID required' })

  // Verify tag belongs to org
  const tag = await prisma.tag.findFirst({
    where: { id, orgId: dbUser.orgId },
  })
  if (!tag) throw createError({ statusCode: 404, message: 'Tag not found' })

  await prisma.tag.delete({ where: { id } })

  return { success: true }
})
