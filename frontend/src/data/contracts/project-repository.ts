import type {
  Alert,
  ChangeEvent,
  Project,
  ProjectPriority,
  ProjectStatus,
  ProjectVersion,
  Sector,
  VersionSource,
} from '@/domain/models'
import type { PageQuery, Paginated } from './common'

export type ProjectSortField = 'name' | 'updatedAt' | 'dueDate' | 'budget'

export interface ProjectQuery extends PageQuery {
  search?: string
  status?: ProjectStatus[]
  priority?: ProjectPriority[]
  sector?: Sector[]
  ownerId?: string
  createdAfter?: string
  includeArchived?: boolean
  onlyArchived?: boolean
  sortBy?: ProjectSortField
  sortDirection?: 'asc' | 'desc'
}

export type CreateProjectInput = Omit<
  Project,
  'id' | 'code' | 'createdAt' | 'updatedAt' | 'archivedAt'
>

export type UpdateProjectInput = Partial<
  Omit<Project, 'id' | 'code' | 'createdAt'>
>

export interface ProjectWriteOptions {
  actorId: string
  source: VersionSource
  now?: string
}

export interface UpdateProjectOptions extends ProjectWriteOptions {
  reason?: string
}

export interface ProjectUpdateResult {
  project: Project
  changed: boolean
  version: ProjectVersion | null
  changes: ChangeEvent[]
  alerts: Alert[]
}

export interface ProjectRepository {
  list(query: ProjectQuery): Promise<Paginated<Project>>
  getAll(): Promise<Project[]>
  getById(id: string): Promise<Project | null>
  create(
    input: CreateProjectInput,
    options?: ProjectWriteOptions,
  ): Promise<Project>
  update(
    id: string,
    input: UpdateProjectInput,
    options?: UpdateProjectOptions,
  ): Promise<ProjectUpdateResult>
  archive(id: string): Promise<void>
  listVersions(id: string): Promise<ProjectVersion[]>
}
