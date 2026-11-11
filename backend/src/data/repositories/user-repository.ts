import type { User } from '../../domain/models/index.js'
import { prisma } from '../../lib/prisma.js'

export const userRepository = {
  async list(): Promise<User[]> {
    const records = await prisma.user.findMany({ orderBy: { name: 'asc' } })

    return records.map((record) => ({
      id: record.id,
      name: record.name,
      email: record.email,
      role: record.role as User['role'],
      ...(record.avatarUrl ? { avatarUrl: record.avatarUrl } : {}),
    }))
  },
}
