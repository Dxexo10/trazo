import { useSearchParams } from 'react-router-dom'
import {
  ALERT_SEVERITIES,
  ALERT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SECTORS,
  type AlertSeverity,
  type AlertStatus,
  type ProjectPriority,
  type ProjectStatus,
  type Sector,
} from '@/domain/models'
import type {
  ArchivedMode,
  RiskFilter,
} from '@/features/projects/hooks/use-project-filters'
import { PERIOD_DAYS, type PeriodDays } from '@/lib/period'

export const REPORT_TABS = ['proyectos', 'alertas'] as const
export type ReportTab = (typeof REPORT_TABS)[number]

const RISK_VALUES: RiskFilter[] = ['alto', 'medio']

export interface ReportFilters {
  tab: ReportTab
  search: string
  projectStatus: ProjectStatus | 'all'
  projectPriority: ProjectPriority | 'all'
  projectSector: Sector | 'all'
  ownerId: string
  risk: RiskFilter | 'all'
  archived: ArchivedMode
  alertStatus: AlertStatus | 'all'
  alertSeverity: AlertSeverity | 'all'
  alertProjectId: string
  alertPeriod: PeriodDays
}

export const DEFAULT_REPORT_FILTERS: ReportFilters = {
  tab: 'proyectos',
  search: '',
  projectStatus: 'all',
  projectPriority: 'all',
  projectSector: 'all',
  ownerId: '',
  risk: 'all',
  archived: 'no',
  alertStatus: 'all',
  alertSeverity: 'all',
  alertProjectId: '',
  alertPeriod: 'all',
}

function parseEnum<T extends string>(
  value: string | null,
  options: readonly T[],
): T | 'all' {
  return value && (options as readonly string[]).includes(value)
    ? (value as T)
    : 'all'
}

function parseArchived(value: string | null): ArchivedMode {
  if (value === 'solo' || value === 'only') return 'only'
  if (value === '1' || value === 'include') return 'include'
  return 'no'
}

export function parseReportFilters(params: URLSearchParams): ReportFilters {
  const period = params.get('a_periodo')

  return {
    tab: params.get('vista') === 'alertas' ? 'alertas' : 'proyectos',
    search: params.get('q')?.trim() ?? '',
    projectStatus: parseEnum(params.get('estado'), PROJECT_STATUSES),
    projectPriority: parseEnum(params.get('prioridad'), PROJECT_PRIORITIES),
    projectSector: parseEnum(params.get('sector'), SECTORS),
    ownerId: params.get('responsable') ?? '',
    risk: parseEnum(params.get('riesgo'), RISK_VALUES),
    archived: parseArchived(params.get('archivados')),
    alertStatus: parseEnum(params.get('a_estado'), ALERT_STATUSES),
    alertSeverity: parseEnum(params.get('a_severidad'), ALERT_SEVERITIES),
    alertProjectId: params.get('a_proyecto') ?? '',
    alertPeriod:
      period && (PERIOD_DAYS as readonly string[]).includes(period)
        ? (period as PeriodDays)
        : DEFAULT_REPORT_FILTERS.alertPeriod,
  }
}

export function serialiseReportFilters(
  filters: ReportFilters,
): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.tab !== DEFAULT_REPORT_FILTERS.tab) {
    params.set('vista', filters.tab)
  }
  if (filters.search) params.set('q', filters.search)
  if (filters.projectStatus !== 'all') {
    params.set('estado', filters.projectStatus)
  }
  if (filters.projectPriority !== 'all') {
    params.set('prioridad', filters.projectPriority)
  }
  if (filters.projectSector !== 'all') {
    params.set('sector', filters.projectSector)
  }
  if (filters.ownerId) params.set('responsable', filters.ownerId)
  if (filters.risk !== 'all') params.set('riesgo', filters.risk)
  if (filters.archived !== 'no') {
    params.set('archivados', filters.archived === 'only' ? 'solo' : '1')
  }
  if (filters.alertStatus !== 'all') params.set('a_estado', filters.alertStatus)
  if (filters.alertSeverity !== 'all') {
    params.set('a_severidad', filters.alertSeverity)
  }
  if (filters.alertProjectId) params.set('a_proyecto', filters.alertProjectId)
  if (filters.alertPeriod !== DEFAULT_REPORT_FILTERS.alertPeriod) {
    params.set('a_periodo', filters.alertPeriod)
  }

  return params
}

export function hasActiveReportFilters(filters: ReportFilters): boolean {
  if (filters.tab === 'alertas') {
    return Boolean(
      filters.alertStatus !== 'all' ||
      filters.alertSeverity !== 'all' ||
      filters.alertProjectId ||
      filters.alertPeriod !== DEFAULT_REPORT_FILTERS.alertPeriod,
    )
  }

  return Boolean(
    filters.search ||
    filters.projectStatus !== 'all' ||
    filters.projectPriority !== 'all' ||
    filters.projectSector !== 'all' ||
    filters.ownerId ||
    filters.risk !== 'all' ||
    filters.archived !== 'no',
  )
}

function clearActiveTab(filters: ReportFilters): ReportFilters {
  if (filters.tab === 'alertas') {
    return {
      ...filters,
      alertStatus: DEFAULT_REPORT_FILTERS.alertStatus,
      alertSeverity: DEFAULT_REPORT_FILTERS.alertSeverity,
      alertProjectId: DEFAULT_REPORT_FILTERS.alertProjectId,
      alertPeriod: DEFAULT_REPORT_FILTERS.alertPeriod,
    }
  }

  return {
    ...filters,
    search: DEFAULT_REPORT_FILTERS.search,
    projectStatus: DEFAULT_REPORT_FILTERS.projectStatus,
    projectPriority: DEFAULT_REPORT_FILTERS.projectPriority,
    projectSector: DEFAULT_REPORT_FILTERS.projectSector,
    ownerId: DEFAULT_REPORT_FILTERS.ownerId,
    risk: DEFAULT_REPORT_FILTERS.risk,
    archived: DEFAULT_REPORT_FILTERS.archived,
  }
}

export function useReportFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseReportFilters(searchParams)

  const update = (patch: Partial<ReportFilters>) => {
    const next = { ...filters, ...patch }
    setSearchParams(serialiseReportFilters(next), { replace: true })
  }

  const clear = () => {
    setSearchParams(serialiseReportFilters(clearActiveTab(filters)), {
      replace: true,
    })
  }

  return { filters, update, clear }
}
