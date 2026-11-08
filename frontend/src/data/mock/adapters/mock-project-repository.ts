import type {
  CreateProjectInput,
  ProjectQuery,
  ProjectRepository,
  UpdateProjectOptions,
  ProjectUpdateResult,
  ProjectWriteOptions,
  UpdateProjectInput,
} from '@/data/contracts'
import { paginate } from '@/data/contracts'
import type { Project, ProjectVersion } from '@/domain/models'
import { DEMO_CURRENT_USER } from '../seed/users'
import { applyProjectUpdate } from '../services/apply-project-update'
import { getDatabase } from '../storage/db'
import { withLatency } from './latency'

function matchesQuery(project: Project, query: ProjectQuery): boolean {
  if (query.onlyArchived) {
    if (project.archivedAt === null) return false
  } else if (!query.includeArchived && project.archivedAt !== null) {
    return false
  }

  if (query.search) {
    const term = query.search.trim().toLowerCase()
    if (term.length > 0) {
      const haystack =
        `${project.name} ${project.code} ${project.client}`.toLowerCase()
      if (!haystack.includes(term)) return false
    }
  }

  if (query.status && query.status.length > 0) {
    if (!query.status.includes(project.status)) return false
  }

  if (query.priority && query.priority.length > 0) {
    if (!query.priority.includes(project.priority)) return false
  }

  if (query.sector && query.sector.length > 0) {
    if (!query.sector.includes(project.sector)) return false
  }

  if (query.ownerId && project.ownerId !== query.ownerId) return false

  if (query.createdAfter && project.createdAt < query.createdAfter) return false

  return true
}

function compareProjects(
  a: Project,
  b: Project,
  sortBy: NonNullable<ProjectQuery['sortBy']>,
): number {
  switch (sortBy) {
    case 'name':
      return a.name.localeCompare(b.name)
    case 'dueDate':
      return a.dueDate.localeCompare(b.dueDate)
    case 'budget':
      return a.currentBudgetCents - b.currentBudgetCents
    case 'updatedAt':
    default:
      return a.updatedAt.localeCompare(b.updatedAt)
  }
}

function nextCode(projects: readonly Project[]): string {
  const highest = projects.reduce((max, project) => {
    const match = /^PRJ-(\d+)$/.exec(project.code)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)

  return `PRJ-${String(highest + 1).padStart(3, '0')}`
}

export class MockProjectRepository implements ProjectRepository {
  async list(query: ProjectQuery) {
    const db = await getDatabase()
    const projects = await db.getAll('projects')
    const filtered = projects.filter((project) => matchesQuery(project, query))
    const sortBy = query.sortBy ?? 'updatedAt'
    const direction = query.sortDirection === 'asc' ? 1 : -1

    const sorted = [...filtered].sort(
      (a, b) => compareProjects(a, b, sortBy) * direction,
    )

    return withLatency(paginate(sorted, query))
  }

  async getAll(): Promise<Project[]> {
    const db = await getDatabase()
    return withLatency(await db.getAll('projects'))
  }

  async getById(id: string): Promise<Project | null> {
    const db = await getDatabase()
    const project = await db.get('projects', id)
    return withLatency(project ?? null)
  }

  async create(
    input: CreateProjectInput,
    options?: ProjectWriteOptions,
  ): Promise<Project> {
    const db = await getDatabase()
    const projects = await db.getAll('projects')
    const now = options?.now ?? new Date().toISOString()
    const actorId = options?.actorId ?? DEMO_CURRENT_USER.id
    const source = options?.source ?? 'manual'

    const project: Project = {
      ...input,
      id: `prj_${crypto.randomUUID()}`,
      code: nextCode(projects),
      createdAt: now,
      updatedAt: now,
      archivedAt: null,
    }

    const version: ProjectVersion = {
      id: `ver_${crypto.randomUUID()}`,
      projectId: project.id,
      versionNumber: 1,
      snapshot: project,
      changedAt: now,
      changedBy: actorId,
      source,
      reason: null,
    }

    const tx = db.transaction(['projects', 'versions', 'activity'], 'readwrite')
    tx.objectStore('projects').put(project)
    tx.objectStore('versions').put(version)
    tx.objectStore('activity').put({
      id: `act_${crypto.randomUUID()}`,
      projectId: project.id,
      actorId,
      action: 'project.created',
      source,
      createdAt: now,
      metadata: { code: project.code },
    })
    tx.objectStore('activity').put({
      id: `act_${crypto.randomUUID()}`,
      projectId: project.id,
      actorId,
      action: 'version.created',
      source,
      createdAt: now,
      metadata: { versionNumber: '1', fields: '0', reason: '' },
    })
    await tx.done

    return withLatency(project)
  }

  async update(
    id: string,
    input: UpdateProjectInput,
    options?: UpdateProjectOptions,
  ): Promise<ProjectUpdateResult> {
    const db = await getDatabase()
    const result = await applyProjectUpdate(db, id, input, {
      actorId: options?.actorId ?? DEMO_CURRENT_USER.id,
      source: options?.source ?? 'manual',
      reason: options?.reason,
      now: options?.now,
    })

    return withLatency(result)
  }

  async archive(id: string): Promise<void> {
    const db = await getDatabase()
    const existing = await db.get('projects', id)

    if (!existing) {
      throw new Error('El proyecto solicitado no existe.')
    }

    const now = new Date().toISOString()
    const tx = db.transaction(['projects', 'activity'], 'readwrite')
    tx.objectStore('projects').put({
      ...existing,
      archivedAt: now,
      updatedAt: now,
    })
    tx.objectStore('activity').put({
      id: `act_${crypto.randomUUID()}`,
      projectId: id,
      actorId: DEMO_CURRENT_USER.id,
      action: 'project.archived',
      source: 'manual',
      createdAt: now,
      metadata: {},
    })
    await tx.done
    await withLatency(undefined)
  }

  async listVersions(id: string): Promise<ProjectVersion[]> {
    const db = await getDatabase()
    const versions = await db.getAll('versions')

    return withLatency(
      versions
        .filter((version) => version.projectId === id)
        .sort((a, b) => b.versionNumber - a.versionNumber),
    )
  }
}
