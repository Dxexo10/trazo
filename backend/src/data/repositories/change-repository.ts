import type { ChangeQuery } from '../../domain/schemas/index.js'
import type { ChangeEvent } from '../../domain/models/index.js'
import { prisma } from '../../lib/prisma.js'
import { toChangeEvent } from '../mappers.js'

export const changeRepository = {
  async list(query: ChangeQuery) {
    const where = {
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.versionId ? { versionId: query.versionId } : {}),
      ...(query.field ? { field: query.field } : {}),
    }
    const skip = (query.page - 1) * query.pageSize

    const [total, records] = await Promise.all([
      prisma.changeEvent.count({ where }),
      prisma.changeEvent.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take: query.pageSize,
      }),
    ])

    return {
      items: records.map(toChangeEvent),
      total,
      page: query.page,
      pageSize: query.pageSize,
    }
  },

  async getAll(): Promise<ChangeEvent[]> {
    const records = await prisma.changeEvent.findMany({
      orderBy: { id: 'asc' },
    })
    return records.map(toChangeEvent)
  },

  async listByProject(projectId: string): Promise<ChangeEvent[]> {
    const records = await prisma.changeEvent.findMany({
      where: { projectId },
      orderBy: { id: 'asc' },
    })
    return records.map(toChangeEvent)
  },

  async listByVersion(versionId: string): Promise<ChangeEvent[]> {
    const records = await prisma.changeEvent.findMany({
      where: { versionId },
      orderBy: { id: 'asc' },
    })
    return records.map(toChangeEvent)
  },
}
