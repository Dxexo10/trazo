export const PROJECT_STATUSES = [
  'planned',
  'in_progress',
  'on_hold',
  'completed',
  'cancelled',
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const

export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number]

export const SECTORS = ['technology', 'construction', 'consulting'] as const

export type Sector = (typeof SECTORS)[number]

export type Currency = 'PEN'

/**
 * Representación serializable del proyecto para la API.
 * `startDate`, `dueDate` y `completedAt` son fechas `YYYY-MM-DD`; las marcas
 * de tiempo (`createdAt`, `updatedAt`, `archivedAt`) son ISO-8601 UTC.
 */
export interface Project {
  id: string
  code: string
  name: string
  description: string
  sector: Sector
  client: string
  ownerId: string
  status: ProjectStatus
  priority: ProjectPriority
  initialBudgetCents: number
  currentBudgetCents: number
  currency: Currency
  progress: number
  startDate: string
  dueDate: string
  completedAt: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
  archivedAt: string | null
}
