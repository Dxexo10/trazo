import type {
  Alert,
  AlertSeverity,
  Project,
  ProjectStatus,
  Sector,
} from '@/domain/models'
import {
  addMonths,
  monthKey,
  monthLabel,
  parseDate,
  shiftMonths,
  toISODate,
} from '@/domain/utils/date'
import { percentageChange } from '@/domain/utils/money'
import {
  assessProjectRisk,
  isOverdue,
  requiresAttention,
  type RiskLevel,
} from './project-metrics'

export type DashboardPeriod = 3 | 6 | 12

export interface DashboardFilters {
  periodMonths: DashboardPeriod
}

export interface TrendPoint {
  month: string
  label: string
  created: number
  completed: number
}

export interface StatusSlice {
  status: ProjectStatus
  count: number
}

export interface SectorBudget {
  sector: Sector
  initialCents: number
  currentCents: number
}

export interface AttentionItem {
  project: Project
  score: number
  level: RiskLevel
  reasons: string[]
}

export interface SeveritySlice {
  severity: AlertSeverity
  count: number
}

export interface DashboardSummary {
  periodMonths: DashboardPeriod
  referenceDate: string
  totals: {
    projects: number
    inProgress: number
    completed: number
    onHold: number
    overdue: number
    attention: number
    openAlerts: number
    plannedBudgetCents: number
    currentBudgetCents: number
  }
  budgetVariationPct: number | null
  deltas: {
    projects: number | null
    inProgress: number | null
    completed: number | null
    attention: number | null
  }
  trend: TrendPoint[]
  statusDistribution: StatusSlice[]
  sectorBudget: SectorBudget[]
  attentionProjects: AttentionItem[]
  alertsBySeverity: SeveritySlice[]
}

interface BuildSummaryInput {
  projects: readonly Project[]
  alerts: readonly Alert[]
  filters: DashboardFilters
  referenceDate: string
}

const STATUS_ORDER: ProjectStatus[] = [
  'in_progress',
  'planned',
  'on_hold',
  'completed',
  'cancelled',
]

const SECTOR_ORDER: Sector[] = ['technology', 'construction', 'consulting']

const SEVERITY_ORDER: AlertSeverity[] = ['critical', 'warning', 'info']

function inRange(createdAt: string, from: string, to: string): boolean {
  return createdAt >= from && createdAt < to
}

export function buildDashboardSummary({
  projects,
  alerts,
  filters,
  referenceDate,
}: BuildSummaryInput): DashboardSummary {
  const reference = parseDate(referenceDate)
  const windowStart = toISODate(addMonths(reference, -filters.periodMonths))
  const previousStart = toISODate(
    addMonths(reference, -filters.periodMonths * 2),
  )
  const today = toISODate(reference)

  const available = projects.filter((project) => project.archivedAt === null)

  const current = available.filter((project) =>
    inRange(project.createdAt, windowStart, `${today}T23:59:59.999Z`),
  )
  const previous = available.filter((project) =>
    inRange(project.createdAt, previousStart, windowStart),
  )

  const availableIds = new Set(available.map((project) => project.id))
  const portfolioAlerts = alerts.filter((alert) =>
    availableIds.has(alert.projectId),
  )
  const openAlerts = portfolioAlerts.filter((alert) => alert.status === 'open')

  const inProgress = available.filter(
    (project) => project.status === 'in_progress',
  ).length
  const completed = available.filter(
    (project) => project.status === 'completed',
  ).length
  const onHold = available.filter(
    (project) => project.status === 'on_hold',
  ).length
  const overdue = available.filter((project) =>
    isOverdue(project, referenceDate),
  ).length
  const attention = available.filter((project) =>
    requiresAttention(project, referenceDate),
  ).length

  const periodInProgress = current.filter(
    (project) => project.status === 'in_progress',
  ).length
  const periodCompleted = current.filter(
    (project) => project.status === 'completed',
  ).length
  const periodAttention = current.filter((project) =>
    requiresAttention(project, referenceDate),
  ).length

  const previousInProgress = previous.filter(
    (project) => project.status === 'in_progress',
  ).length
  const previousCompleted = previous.filter(
    (project) => project.status === 'completed',
  ).length
  const previousAttention = previous.filter((project) =>
    requiresAttention(project, referenceDate),
  ).length

  const plannedBudgetCents = available.reduce(
    (total, project) => total + project.initialBudgetCents,
    0,
  )
  const currentBudgetCents = available.reduce(
    (total, project) => total + project.currentBudgetCents,
    0,
  )

  const trend: TrendPoint[] = Array.from(
    { length: filters.periodMonths },
    (_, index) => {
      const monthDate = shiftMonths(reference, index - filters.periodMonths + 1)
      const key = monthKey(monthDate)

      return {
        month: key,
        label: monthLabel(key),
        created: available.filter(
          (project) => monthKey(parseDate(project.createdAt)) === key,
        ).length,
        completed: available.filter(
          (project) =>
            project.completedAt !== null &&
            monthKey(parseDate(project.completedAt)) === key,
        ).length,
      }
    },
  )

  const statusDistribution: StatusSlice[] = STATUS_ORDER.map((status) => ({
    status,
    count: available.filter((project) => project.status === status).length,
  }))

  const sectorBudget: SectorBudget[] = SECTOR_ORDER.map((sector) => {
    const sectorProjects = available.filter(
      (project) => project.sector === sector,
    )
    return {
      sector,
      initialCents: sectorProjects.reduce(
        (total, project) => total + project.initialBudgetCents,
        0,
      ),
      currentCents: sectorProjects.reduce(
        (total, project) => total + project.currentBudgetCents,
        0,
      ),
    }
  })

  const attentionProjects: AttentionItem[] = available
    .map((project) => {
      const risk = assessProjectRisk(project, referenceDate)
      return {
        project,
        score: risk.score,
        level: risk.level,
        reasons: risk.reasons,
      }
    })
    .filter((item) => item.level !== 'low')
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const alertsBySeverity: SeveritySlice[] = SEVERITY_ORDER.map((severity) => ({
    severity,
    count: openAlerts.filter((alert) => alert.severity === severity).length,
  }))

  return {
    periodMonths: filters.periodMonths,
    referenceDate,
    totals: {
      projects: available.length,
      inProgress,
      completed,
      onHold,
      overdue,
      attention,
      openAlerts: openAlerts.length,
      plannedBudgetCents,
      currentBudgetCents,
    },
    budgetVariationPct: percentageChange(
      plannedBudgetCents,
      currentBudgetCents,
    ),
    deltas: {
      projects: percentageChange(previous.length, current.length),
      inProgress: percentageChange(previousInProgress, periodInProgress),
      completed: percentageChange(previousCompleted, periodCompleted),
      attention: percentageChange(previousAttention, periodAttention),
    },
    trend,
    statusDistribution,
    sectorBudget,
    attentionProjects,
    alertsBySeverity,
  }
}
