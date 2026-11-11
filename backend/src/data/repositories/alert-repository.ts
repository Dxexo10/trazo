import { randomUUID } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import type {
  AlertQuery,
  AlertStatusUpdate,
} from '../../domain/schemas/index.js'
import type { Alert } from '../../domain/models/index.js'
import { DEMO_CURRENT_USER } from '../../domain/seed/users.js'
import { NotFoundError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import { toAlert } from '../mappers.js'

function buildWhere(query: AlertQuery): Prisma.AlertWhereInput {
  const where: Prisma.AlertWhereInput = {}

  if (query.status && query.status.length > 0)
    where.status = { in: query.status }
  if (query.severity && query.severity.length > 0) {
    where.severity = { in: query.severity }
  }
  if (query.projectId) where.projectId = query.projectId
  if (query.createdAfter)
    where.createdAt = { gte: new Date(query.createdAfter) }

  return where
}

export const alertRepository = {
  async list(query: AlertQuery) {
    const where = buildWhere(query)
    const skip = (query.page - 1) * query.pageSize

    const [total, records] = await Promise.all([
      prisma.alert.count({ where }),
      prisma.alert.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        skip,
        take: query.pageSize,
      }),
    ])

    return {
      items: records.map(toAlert),
      total,
      page: query.page,
      pageSize: query.pageSize,
    }
  },

  async getAll(): Promise<Alert[]> {
    const records = await prisma.alert.findMany({
      orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
    })
    return records.map(toAlert)
  },

  async getById(id: string): Promise<Alert | null> {
    const record = await prisma.alert.findUnique({ where: { id } })
    return record ? toAlert(record) : null
  },

  async updateStatus(id: string, input: AlertStatusUpdate): Promise<Alert> {
    const existing = await prisma.alert.findUnique({ where: { id } })
    if (!existing) throw new NotFoundError('La alerta solicitada no existe.')

    const now = new Date().toISOString()
    const status = input.status
    const reviewedAt = status === 'open' ? null : new Date(now)
    const resolvedAt = status === 'resolved' ? new Date(now) : null

    const [record] = await prisma.$transaction([
      prisma.alert.update({
        where: { id },
        data: { status, reviewedAt, resolvedAt },
      }),
      prisma.activityLog.create({
        data: {
          id: randomUUID(),
          projectId: existing.projectId,
          actorId: DEMO_CURRENT_USER.id,
          action: status === 'resolved' ? 'alert.resolved' : 'alert.reviewed',
          source: 'manual',
          createdAt: new Date(now),
          metadata: JSON.stringify({
            alertId: id,
            ruleId: existing.ruleId,
            previousStatus: existing.status,
          }),
        },
      }),
    ])

    return toAlert(record)
  },

  async countOpen(): Promise<number> {
    return prisma.alert.count({
      where: {
        status: 'open',
        project: { archivedAt: null },
      },
    })
  },
}
