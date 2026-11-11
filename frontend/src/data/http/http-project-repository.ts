import type {
  CreateProjectInput,
  ProjectQuery,
  ProjectRepository,
  ProjectUpdateResult,
  UpdateProjectInput,
  UpdateProjectOptions,
} from '@/data/contracts'
import type { Project, ProjectVersion } from '@/domain/models'
import {
  apiGet,
  apiGetAllPages,
  apiList,
  apiRequest,
  isNotFoundError,
  type QueryValue,
} from './client'

const UPDATE_FIELDS = [
  'name',
  'description',
  'sector',
  'client',
  'ownerId',
  'status',
  'priority',
  'initialBudgetCents',
  'currentBudgetCents',
  'currency',
  'progress',
  'startDate',
  'dueDate',
  'completedAt',
  'tags',
] as const

function projectQueryParams(query: ProjectQuery): Record<string, QueryValue> {
  return {
    search: query.search,
    status: query.status,
    priority: query.priority,
    sector: query.sector,
    ownerId: query.ownerId,
    createdAfter: query.createdAfter,
    sortBy: query.sortBy,
    sortDirection: query.sortDirection,
    includeArchived: query.includeArchived ? true : undefined,
    onlyArchived: query.onlyArchived ? true : undefined,
  }
}

function toCreateBody(input: CreateProjectInput): Record<string, unknown> {
  return {
    name: input.name,
    description: input.description,
    sector: input.sector,
    client: input.client,
    ownerId: input.ownerId,
    status: input.status,
    priority: input.priority,
    initialBudgetCents: input.initialBudgetCents,
    currentBudgetCents: input.currentBudgetCents,
    currency: input.currency,
    progress: input.progress,
    startDate: input.startDate,
    dueDate: input.dueDate,
    completedAt: input.completedAt,
    tags: input.tags,
  }
}

function toUpdateBody(input: UpdateProjectInput): Record<string, unknown> {
  const body: Record<string, unknown> = {}

  for (const field of UPDATE_FIELDS) {
    const value = input[field]
    if (value !== undefined) body[field] = value
  }

  return body
}

export class HttpProjectRepository implements ProjectRepository {
  async list(query: ProjectQuery) {
    return apiList<Project>('/projects', projectQueryParams(query), {
      page: query.page,
      pageSize: query.pageSize,
    })
  }

  async getAll(): Promise<Project[]> {
    return apiGetAllPages<Project>('/projects', { includeArchived: true })
  }

  async getById(id: string): Promise<Project | null> {
    try {
      return await apiGet<Project>(`/projects/${encodeURIComponent(id)}`)
    } catch (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
  }

  async create(input: CreateProjectInput): Promise<Project> {
    return apiRequest<Project>('/projects', {
      method: 'POST',
      body: toCreateBody(input),
    })
  }

  async update(
    id: string,
    input: UpdateProjectInput,
    options?: UpdateProjectOptions,
  ): Promise<ProjectUpdateResult> {
    return apiRequest<ProjectUpdateResult>(
      `/projects/${encodeURIComponent(id)}`,
      {
        method: 'PATCH',
        query: { reason: options?.reason },
        body: toUpdateBody(input),
      },
    )
  }

  async archive(id: string): Promise<void> {
    await apiRequest<void>(`/projects/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
    })
  }

  async listVersions(id: string): Promise<ProjectVersion[]> {
    return apiGet<ProjectVersion[]>(
      `/projects/${encodeURIComponent(id)}/versions`,
    )
  }
}
