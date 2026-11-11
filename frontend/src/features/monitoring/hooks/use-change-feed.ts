import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  alertRepository,
  changeEventRepository,
  projectRepository,
  userRepository,
  versionRepository,
} from '@/data'
import { buildChangeFeed } from '@/domain/services/change-feed'
import { parseDate } from '@/domain/utils/date'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import {
  MONITOR_PAGE_SIZE,
  type MonitorFilters,
  type MonitorPeriod,
} from './use-monitor-filters'

function periodStart(period: MonitorPeriod): string | undefined {
  if (period === 'all') return undefined

  const reference = parseDate(DEMO_REFERENCE_DATE)
  return new Date(
    reference.getTime() - Number(period) * 86_400_000,
  ).toISOString()
}

async function fetchChangeFeed(filters: MonitorFilters) {
  const [changes, versions, alerts, projects, users] = await Promise.all([
    changeEventRepository.getAll(),
    versionRepository.getAll(),
    alertRepository.getAll(),
    projectRepository.getAll(),
    userRepository.list(),
  ])

  return buildChangeFeed({
    changes,
    versions,
    alerts,
    projects,
    users,
    filters: {
      projectId: filters.projectId || undefined,
      field: filters.field,
      source: filters.source,
      severity: filters.severity,
      from: periodStart(filters.period),
    },
    page: filters.page,
    pageSize: MONITOR_PAGE_SIZE,
  })
}

export function useChangeFeed(filters: MonitorFilters) {
  return useQuery({
    queryKey: ['monitor', 'feed', filters],
    queryFn: () => fetchChangeFeed(filters),
    placeholderData: keepPreviousData,
  })
}

export function useMonitorProjects() {
  return useQuery({
    queryKey: ['projects', 'monitor-options'],
    queryFn: () => projectRepository.getAll(),
  })
}
