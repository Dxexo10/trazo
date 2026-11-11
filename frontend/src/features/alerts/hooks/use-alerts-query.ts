import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { alertRepository, projectRepository } from '@/data'
import type { Alert, Project, ProjectStatus } from '@/domain/models'
import type { AlertStatus } from '@/domain/models'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { periodStart } from '@/lib/period'
import { ALERTS_PAGE_SIZE, type AlertFilters } from './use-alert-filters'

export interface AlertCounts {
  open: number
  critical: number
  reviewed: number
  resolved: number
}

export interface AlertListResult {
  items: Alert[]
  total: number
  page: number
  pageSize: number
  counts: AlertCounts
  projectById: Map<string, Project>
}

const ACTIVE_PROJECT_STATUSES: ProjectStatus[] = [
  'planned',
  'in_progress',
  'on_hold',
  'completed',
]

function matchesStatus(alert: Alert, status: AlertStatus): boolean {
  return alert.status === status
}

async function fetchAlerts(filters: AlertFilters): Promise<AlertListResult> {
  const [alerts, projects] = await Promise.all([
    alertRepository.getAll(),
    projectRepository.getAll(),
  ])

  const projectById = new Map(projects.map((project) => [project.id, project]))
  const activeProjectIds = new Set(
    projects
      .filter(
        (project) =>
          project.archivedAt === null &&
          ACTIVE_PROJECT_STATUSES.includes(project.status),
      )
      .map((project) => project.id),
  )

  const portfolioAlerts = alerts.filter((alert) =>
    activeProjectIds.has(alert.projectId),
  )

  const counts: AlertCounts = {
    open: portfolioAlerts.filter((alert) => matchesStatus(alert, 'open'))
      .length,
    critical: portfolioAlerts.filter(
      (alert) => alert.status === 'open' && alert.severity === 'critical',
    ).length,
    reviewed: portfolioAlerts.filter((alert) =>
      matchesStatus(alert, 'reviewed'),
    ).length,
    resolved: portfolioAlerts.filter((alert) =>
      matchesStatus(alert, 'resolved'),
    ).length,
  }

  const from = periodStart(filters.period, DEMO_REFERENCE_DATE)
  const filtered = portfolioAlerts.filter((alert) => {
    if (filters.status !== 'all' && alert.status !== filters.status)
      return false
    if (filters.severity !== 'all' && alert.severity !== filters.severity) {
      return false
    }
    if (filters.projectId && alert.projectId !== filters.projectId) return false
    if (from && alert.createdAt < from) return false
    return true
  })

  const sorted = [...filtered].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
  const safePage = Math.max(1, filters.page)
  const start = (safePage - 1) * ALERTS_PAGE_SIZE

  return {
    items: sorted.slice(start, start + ALERTS_PAGE_SIZE),
    total: sorted.length,
    page: safePage,
    pageSize: ALERTS_PAGE_SIZE,
    counts,
    projectById,
  }
}

export function useAlertsQuery(filters: AlertFilters) {
  return useQuery({
    queryKey: ['alerts', 'list', filters],
    queryFn: () => fetchAlerts(filters),
    placeholderData: keepPreviousData,
  })
}
