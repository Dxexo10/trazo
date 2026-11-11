import { useSearchParams } from 'react-router-dom'
import {
  ALERT_SEVERITIES,
  ALERT_STATUSES,
  type AlertSeverity,
  type AlertStatus,
} from '@/domain/models'
import { PERIOD_DAYS, type PeriodDays } from '@/lib/period'

export const ALERTS_PAGE_SIZE = 10

export const ALERT_PERIODS = PERIOD_DAYS
export type AlertPeriod = PeriodDays

export interface AlertFilters {
  status: AlertStatus | 'all'
  severity: AlertSeverity | 'all'
  projectId: string
  period: AlertPeriod
  page: number
}

export const DEFAULT_ALERT_FILTERS: AlertFilters = {
  status: 'all',
  severity: 'all',
  projectId: '',
  period: 'all',
  page: 1,
}

function parseEnum<T extends string>(
  value: string | null,
  options: readonly T[],
  fallback: T | 'all',
): T | 'all' {
  return value && options.includes(value as T) ? (value as T) : fallback
}

export function parseAlertFilters(params: URLSearchParams): AlertFilters {
  const page = Number(params.get('pagina'))

  return {
    status: parseEnum(params.get('estado'), ALERT_STATUSES, 'all'),
    severity: parseEnum(params.get('severidad'), ALERT_SEVERITIES, 'all'),
    projectId: params.get('proyecto') ?? '',
    period:
      params.get('periodo') &&
      ALERT_PERIODS.includes(params.get('periodo') as AlertPeriod)
        ? (params.get('periodo') as AlertPeriod)
        : DEFAULT_ALERT_FILTERS.period,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  }
}

export function serialiseAlertFilters(filters: AlertFilters): URLSearchParams {
  const params = new URLSearchParams()

  if (filters.status !== 'all') params.set('estado', filters.status)
  if (filters.severity !== 'all') params.set('severidad', filters.severity)
  if (filters.projectId) params.set('proyecto', filters.projectId)
  if (filters.period !== DEFAULT_ALERT_FILTERS.period) {
    params.set('periodo', filters.period)
  }
  if (filters.page > 1) params.set('pagina', String(filters.page))

  return params
}

export function hasActiveAlertFilters(filters: AlertFilters): boolean {
  return Boolean(
    filters.status !== 'all' ||
    filters.severity !== 'all' ||
    filters.projectId ||
    filters.period !== DEFAULT_ALERT_FILTERS.period,
  )
}

export function useAlertFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = parseAlertFilters(searchParams)

  const update = (patch: Partial<AlertFilters>) => {
    const next: AlertFilters = {
      ...filters,
      ...patch,
      page: patch.page ?? 1,
    }
    setSearchParams(serialiseAlertFilters(next), { replace: true })
  }

  const clear = () => {
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  return { filters, update, clear }
}
