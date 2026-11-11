import { useQuery } from '@tanstack/react-query'
import { alertRepository, projectRepository } from '@/data'
import type { Alert, Project } from '@/domain/models'
import { assessProjectRisk } from '@/domain/services/project-metrics'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { periodStart } from '@/lib/period'
import type { ReportFilters } from './use-report-filters'

export const REPORT_MAX_ROWS = 500

const PORTFOLIO_STATUSES: Project['status'][] = [
  'planned',
  'in_progress',
  'on_hold',
  'completed',
]

async function fetchProjectRows(filters: ReportFilters): Promise<Project[]> {
  const result = await projectRepository.list({
    page: 1,
    pageSize: REPORT_MAX_ROWS,
    search: filters.search || undefined,
    status:
      filters.projectStatus === 'all' ? undefined : [filters.projectStatus],
    priority:
      filters.projectPriority === 'all' ? undefined : [filters.projectPriority],
    sector:
      filters.projectSector === 'all' ? undefined : [filters.projectSector],
    ownerId: filters.ownerId || undefined,
    includeArchived: filters.archived === 'include',
    onlyArchived: filters.archived === 'only',
    sortBy: 'updatedAt',
    sortDirection: 'desc',
  })

  if (filters.risk === 'all') return result.items

  const wanted = filters.risk === 'alto' ? 'high' : 'medium'
  return result.items.filter(
    (project) =>
      assessProjectRisk(project, DEMO_REFERENCE_DATE).level === wanted,
  )
}

export interface AlertReportResult {
  alerts: Alert[]
  projectById: Map<string, Project>
  projects: Project[]
}

async function fetchAlertRows(
  filters: ReportFilters,
): Promise<AlertReportResult> {
  const [alerts, projects] = await Promise.all([
    alertRepository.getAll(),
    projectRepository.getAll(),
  ])

  const portfolioProjects = projects.filter(
    (project) =>
      project.archivedAt === null &&
      PORTFOLIO_STATUSES.includes(project.status),
  )
  const portfolioIds = new Set(portfolioProjects.map((project) => project.id))
  const projectById = new Map(projects.map((project) => [project.id, project]))
  const from = periodStart(filters.alertPeriod, DEMO_REFERENCE_DATE)

  const rows = alerts
    .filter((alert) => portfolioIds.has(alert.projectId))
    .filter(
      (alert) =>
        filters.alertStatus === 'all' || alert.status === filters.alertStatus,
    )
    .filter(
      (alert) =>
        filters.alertSeverity === 'all' ||
        alert.severity === filters.alertSeverity,
    )
    .filter(
      (alert) =>
        !filters.alertProjectId || alert.projectId === filters.alertProjectId,
    )
    .filter((alert) => !from || alert.createdAt >= from)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return { alerts: rows, projectById, projects: portfolioProjects }
}

export function useProjectReportQuery(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'projects', filters],
    queryFn: () => fetchProjectRows(filters),
    enabled: filters.tab === 'proyectos',
  })
}

export function useAlertReportQuery(filters: ReportFilters) {
  return useQuery({
    queryKey: ['reports', 'alerts', filters],
    queryFn: () => fetchAlertRows(filters),
    enabled: filters.tab === 'alertas',
  })
}
