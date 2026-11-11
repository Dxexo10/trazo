import type { VersionQuery } from '../../domain/schemas/index.js'
import type { ProjectVersion } from '../../domain/models/index.js'
import { prisma } from '../../lib/prisma.js'
import { toProjectVersion } from '../mappers.js'

export const versionRepository = {
  async list(query: VersionQuery) {
    const where = {
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.from || query.to
        ? {
            changedAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    }
    const skip = (query.page - 1) * query.pageSize

    const [total, records] = await Promise.all([
      prisma.projectVersion.count({ where }),
      prisma.projectVersion.findMany({
        where,
        orderBy: [{ changedAt: 'desc' }, { id: 'asc' }],
        skip,
        take: query.pageSize,
      }),
    ])

    return {
      items: records.map(toProjectVersion),
      total,
      page: query.page,
      pageSize: query.pageSize,
    }
  },

  async getAll(): Promise<ProjectVersion[]> {
    const records = await prisma.projectVersion.findMany({
      orderBy: [{ changedAt: 'desc' }, { id: 'asc' }],
    })
    return records.map(toProjectVersion)
  },

  async getById(id: string): Promise<ProjectVersion | null> {
    const record = await prisma.projectVersion.findUnique({ where: { id } })
    return record ? toProjectVersion(record) : null
  },

  async listByProject(projectId: string): Promise<ProjectVersion[]> {
    const records = await prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: [{ changedAt: 'desc' }, { id: 'asc' }],
    })
    return records.map(toProjectVersion)
  },
}
