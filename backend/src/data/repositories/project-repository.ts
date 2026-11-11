import { randomUUID } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import type {
  CreateProjectInput,
  ProjectQuery,
  UpdateProjectInput,
} from '../../domain/schemas/index.js'
import type { Project, ProjectVersion } from '../../domain/models/index.js'
import { DEMO_CURRENT_USER } from '../../domain/seed/users.js'
import { parseDate } from '../../domain/utils/date.js'
import { AppError, NotFoundError } from '../../lib/errors.js'
import { prisma } from '../../lib/prisma.js'
import { toProject, toProjectVersion } from '../mappers.js'
import {
  applyProjectUpdate,
  type ProjectWriteOptions,
  type UpdateProjectOptions,
  type ProjectUpdateResult,
} from '../services/apply-project-update.js'

function matchesArchivedFilter(
  query: ProjectQuery,
): Prisma.ProjectWhereInput['archivedAt'] {
  if (query.onlyArchived) return { not: null }
  if (!query.includeArchived) return null
  return undefined
}

function buildWhere(query: ProjectQuery): Prisma.ProjectWhereInput {
  const where: Prisma.ProjectWhereInput = {}
  const archivedAt = matchesArchivedFilter(query)

  if (archivedAt !== undefined) where.archivedAt = archivedAt

  if (query.search) {
    const term = query.search.trim()
    if (term.length > 0) {
      where.OR = [
        { name: { contains: term } },
        { code: { contains: term } },
        { client: { contains: term } },
      ]
    }
  }

  if (query.status && query.status.length > 0)
    where.status = { in: query.status }
  if (query.priority && query.priority.length > 0) {
    where.priority = { in: query.priority }
  }
  if (query.sector && query.sector.length > 0)
    where.sector = { in: query.sector }
  if (query.ownerId) where.ownerId = query.ownerId
  if (query.createdAfter)
    where.createdAt = { gte: new Date(query.createdAfter) }

  return where
}

function buildOrderBy(
  query: ProjectQuery,
): Prisma.ProjectOrderByWithRelationInput {
  const direction = query.sortDirection === 'asc' ? 'asc' : 'desc'
  switch (query.sortBy) {
    case 'name':
      return { name: direction }
    case 'dueDate':
      return { dueDate: direction }
    case 'budget':
      return { currentBudgetCents: direction }
    case 'updatedAt':
    default:
      return { updatedAt: direction }
  }
}

function nextCode(projects: readonly { code: string }[]): string {
  const highest = projects.reduce((max, project) => {
    const match = /^PRJ-(\d+)$/.exec(project.code)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  return `PRJ-${String(highest + 1).padStart(3, '0')}`
}

function projectData(project: Project) {
  return {
    id: project.id,
    code: project.code,
    name: project.name,
    description: project.description,
    sector: project.sector,
    client: project.client,
    ownerId: project.ownerId,
    status: project.status,
    priority: project.priority,
    initialBudgetCents: project.initialBudgetCents,
    currentBudgetCents: project.currentBudgetCents,
    currency: project.currency,
    progress: project.progress,
    startDate: parseDate(project.startDate),
    dueDate: parseDate(project.dueDate),
    completedAt: project.completedAt ? parseDate(project.completedAt) : null,
    tags: JSON.stringify(project.tags),
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
    archivedAt: project.archivedAt ? new Date(project.archivedAt) : null,
  }
}

async function getRecord(id: string) {
  const record = await prisma.project.findUnique({ where: { id } })
  if (!record) throw new NotFoundError('El proyecto solicitado no existe.')
  return record
}

export const projectRepository = {
  async list(query: ProjectQuery) {
    const where = buildWhere(query)
    const pageSize = query.pageSize
    const skip = (query.page - 1) * pageSize

    const [total, records] = await Promise.all([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: buildOrderBy(query),
        skip,
        take: pageSize,
      }),
    ])

    return {
      items: records.map(toProject),
      total,
      page: query.page,
      pageSize,
    }
  },

  async getAll(): Promise<Project[]> {
    const records = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
    })
    return records.map(toProject)
  },

  async getById(id: string): Promise<Project | null> {
    const record = await prisma.project.findUnique({ where: { id } })
    return record ? toProject(record) : null
  },

  async create(
    input: CreateProjectInput,
    options?: ProjectWriteOptions,
  ): Promise<Project> {
    const actorId = options?.actorId ?? DEMO_CURRENT_USER.id
    const source = options?.source ?? 'manual'
    const now = options?.now ?? new Date().toISOString()

    const owner = await prisma.user.findUnique({
      where: { id: input.ownerId },
      select: { id: true },
    })
    if (!owner) {
      throw new AppError(400, 'invalid_owner', 'El responsable no existe.')
    }

    const codes = await prisma.project.findMany({ select: { code: true } })

    const project: Project = {
      ...input,
      id: randomUUID(),
      code: nextCode(codes),
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    }

    const version: ProjectVersion = {
      id: randomUUID(),
      projectId: project.id,
      versionNumber: 1,
      snapshot: project,
      changedAt: now,
      changedBy: actorId,
      source,
      reason: null,
    }

    await prisma.$transaction(async (tx) => {
      await tx.project.create({ data: projectData(project) })

      await tx.projectVersion.create({
        data: {
          id: version.id,
          projectId: version.projectId,
          versionNumber: version.versionNumber,
          snapshot: JSON.stringify(version.snapshot),
          changedAt: new Date(version.changedAt),
          changedBy: version.changedBy,
          source: version.source,
          reason: version.reason ?? null,
        },
      })

      await tx.activityLog.createMany({
        data: [
          {
            id: randomUUID(),
            projectId: project.id,
            actorId,
            action: 'project.created',
            source,
            createdAt: new Date(now),
            metadata: JSON.stringify({ code: project.code }),
          },
          {
            id: randomUUID(),
            projectId: project.id,
            actorId,
            action: 'version.created',
            source,
            createdAt: new Date(now),
            metadata: JSON.stringify({
              versionNumber: '1',
              fields: '0',
              reason: '',
            }),
          },
        ],
      })
    })

    return project
  },

  async update(
    id: string,
    input: UpdateProjectInput,
    options?: UpdateProjectOptions,
  ): Promise<ProjectUpdateResult> {
    return prisma.$transaction(
      (tx) =>
        applyProjectUpdate(tx, id, input, {
          actorId: options?.actorId ?? DEMO_CURRENT_USER.id,
          source: options?.source ?? 'manual',
          reason: options?.reason,
          now: options?.now,
        }),
      { timeout: 20_000 },
    )
  },

  async archive(id: string): Promise<void> {
    const existing = await getRecord(id)
    const now = new Date().toISOString()

    await prisma.$transaction(async (tx) => {
      await tx.project.update({
        where: { id },
        data: {
          archivedAt: new Date(now),
          updatedAt: new Date(now),
        },
      })

      await tx.activityLog.create({
        data: {
          id: randomUUID(),
          projectId: existing.id,
          actorId: DEMO_CURRENT_USER.id,
          action: 'project.archived',
          source: 'manual',
          createdAt: new Date(now),
          metadata: JSON.stringify({}),
        },
      })
    })
  },

  async listVersions(id: string): Promise<ProjectVersion[]> {
    await getRecord(id)

    const records = await prisma.projectVersion.findMany({
      where: { projectId: id },
      orderBy: { versionNumber: 'desc' },
    })

    return records.map(toProjectVersion)
  },
}
