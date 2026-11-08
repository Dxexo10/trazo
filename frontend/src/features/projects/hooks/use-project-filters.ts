import { useSearchParams } from 'react-router-dom'
import type { ProjectSortField } from '@/data'
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SECTORS,
  type ProjectPriority,
  type ProjectStatus,
  type Sector,
} from '@/domain/models'

export const PROJECTS_PAGE_SIZE = 10

export type RiskFilter = 'alto' | 'medio'
export type ArchivedMode = 'no' | 'include' | 'only'
export type FilterValue<T extends string> = T | 'all'

export interface ProjectFilters {
  search: string
  status: FilterValue<ProjectStatus>
  priority: FilterValue<ProjectPriority>
  sector: FilterValue<Sector>
  ownerId: string
  risk: FilterValue<RiskFilter>
  archived: ArchivedMode
  sortBy: ProjectSortField
  sortDirection: 'asc' | 'desc'
  page: number
}

const SORT_FIELDS: ProjectSortField[] = [
  'updatedAt',
  'name',
  'dueDate',
  'budget',
]
const RISK_VALUES: RiskFilter[] = ['alto', 'medio']

const ARCHIVED_TO_URL: Record<ArchivedMode, string | null> = {
  no: null,
  include: '1',
  only: 'solo',
}

function parseArchived(value: string | null): ArchivedMode {
  if (value === 'solo' || value === 'only') return 'only'
  if (value === '1' || value === 'include') return 'include'
  return 'no'
}

function parseEnum<T extends string>(
  value: string | null,
  options: readonly T[],
): T | 'all' {
  return value && options.includes(value as T) ? (value as T) : 'all'
}

export function parseProjectFilters(params: URLSearchParams): ProjectFilters {
  const page = Number(params.get('pagina'))
  const sort = parseEnum(params.get('orden'), SORT_FIELDS)

  return {
    search: params.get('q')?.trim() ?? '',
    status: parseEnum(params.get('estado'), PROJECT_STATUSES),
    priority: parseEnum(params.get('prioridad'), PROJECT_PRIORITIES),
    sector: parseEnum(params.get('sector'), SECTORS),
    ownerId: params.get('responsable') ?? '',
    risk: parseEnum(params.get('riesgo'), RISK_VALUES),
    archived: parseArchived(params.get('archivados')),
    sortBy: sort === 'all' ? 'updatedAt' : sort,
    sortDirection: params.get('dir') === 'asc' ? 'asc' : 'desc',
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

function sortField(value: ProjectSortField): ProjectSortField {
  return SORT_FIELDS.includes(value) ? value : 'updatedAt'
}

export function serialiseProjectFilters(
  filters: ProjectFilters,
): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.search) params.set('q', filters.search)
  if (filters.status !== 'all') params.set('estado', filters.status)
  if (filters.priority !== 'all') params.set('prioridad', filters.priority)
  if (filters.sector !== 'all') params.set('sector', filters.sector)
  if (filters.ownerId) params.set('responsable', filters.ownerId)
  if (filters.risk !== 'all') params.set('riesgo', filters.risk)
  const archived = ARCHIVED_TO_URL[filters.archived]
  if (archived) params.set('archivados', archived)

  const sortBy = sortField(filters.sortBy)
  if (sortBy !== 'updatedAt') params.set('orden', sortBy)
  if (filters.sortDirection !== 'desc') params.set('dir', filters.sortDirection)
  if (filters.page > 1) params.set('pagina', String(filters.page))

  return params
}

export function hasActiveFilters(filters: ProjectFilters): boolean {
  return Boolean(
    filters.search ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    filters.sector !== 'all' ||
    filters.ownerId ||
    filters.risk !== 'all' ||
    filters.archived !== 'no',
  )
}

export function useProjectFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseProjectFilters(searchParams)

  const update = (patch: Partial<ProjectFilters>) => {
    const next: ProjectFilters = {
      ...filters,
      ...patch,
      page: patch.page ?? 1,
    }
    setSearchParams(serialiseProjectFilters(next), { replace: true })
  }

  const clear = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return { filters, update, clear }
}
