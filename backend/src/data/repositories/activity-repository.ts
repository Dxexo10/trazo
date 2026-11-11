import type { Prisma } from '@prisma/client'
import type { ActivityQuery } from '../../domain/schemas/index.js'
import type { ActivityLog } from '../../domain/models/index.js'
import { prisma } from '../../lib/prisma.js'
import { toActivityLog } from '../mappers.js'

function buildWhere(query: ActivityQuery): Prisma.ActivityLogWhereInput {
  const where: Prisma.ActivityLogWhereInput = {}

  if (query.projectId) where.projectId = query.projectId
  if (query.actorId) where.actorId = query.actorId
  if (query.action) where.action = query.action
  if (query.source && query.source.length > 0) {
    where.source = { in: query.source }
  }
  if (query.createdAfter)
    where.createdAt = { gte: new Date(query.createdAfter) }

  return where
}

export const activityRepository = {
  async list(query: ActivityQuery) {
    const where = buildWhere(query)
    const skip = (query.page - 1) * query.pageSize

    const [total, records] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip,
        take: query.pageSize,
      }),
    ])

    return {
      items: records.map(toActivityLog),
      total,
      page: query.page,
      pageSize: query.pageSize,
    }
  },

  async getAll(): Promise<ActivityLog[]> {
    const records = await prisma.activityLog.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    })
    return records.map(toActivityLog)
  },
}
