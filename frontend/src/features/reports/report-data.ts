import type { Alert, Project, User } from '@/domain/models'
import { budgetVariation, isOverdue } from '@/domain/services/project-metrics'
import { formatDate } from '@/domain/utils/date'
import {
  formatCurrency,
  formatPercentage,
  percentageChange,
} from '@/domain/utils/money'
import type { AlertFilters } from '@/features/alerts/hooks/use-alert-filters'
import type { ProjectFilters } from '@/features/projects/hooks/use-project-filters'
import { DEMO_LABEL } from '@/lib/demo-config'
import { formatNumber } from '@/lib/format-number'
import {
  ALERT_STATUS_LABELS,
  PRIORITY_LABELS,
  RULE_LABELS,
  SECTOR_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from '@/lib/labels'
import type { PeriodDays } from '@/lib/period'

export type ReportColumnKind =
  'text' | 'integer' | 'currency' | 'percent' | 'date'

export interface ReportColumn {
  key: string
  label: string
  kind: ReportColumnKind
}

export type ReportCellValue = string | number | null

export interface ReportRow {
  [key: string]: ReportCellValue
}

export interface ReportMetric {
  label: string
  value: string
}

export interface ReportMetadata {
  title: string
  datasetLabel: string
  lines: string[]
}

export interface ReportDocument {
  sheetName: string
  fileBaseName: string
  metadata: ReportMetadata
  columns: ReportColumn[]
  rows: ReportRow[]
  metrics: ReportMetric[]
}

const GENERATED_FORMATTER = new Intl.DateTimeFormat('es-PE', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const PERIOD_LABELS: Record<PeriodDays, string> = {
  '30': 'Últimos 30 días',
  '90': 'Últimos 90 días',
  '365': 'Últimos 12 meses',
  all: 'Todo el historial',
}

export function formatGeneratedAt(value: string): string {
  return GENERATED_FORMATTER.format(new Date(value))
}

export function formatReportCell(
  column: ReportColumn,
  value: ReportCellValue | undefined,
): string {
  if (value === null || value === undefined || value === '') return '—'

  switch (column.kind) {
    case 'currency':
      return typeof value === 'number' ? formatCurrency(value) : String(value)
    case 'percent':
      return typeof value === 'number' ? formatPercentage(value) : String(value)
    case 'date':
      return typeof value === 'string' ? formatDate(value) : String(value)
    case 'integer':
      return typeof value === 'number' ? formatNumber(value) : String(value)
    default:
      return String(value)
  }
}

function ruleLabel(ruleId: string): string {
  const labels = RULE_LABELS as Record<string, { label: string } | undefined>
  return labels[ruleId]?.label ?? ruleId
}

function filterLine(parts: string[]): string {
  return `Filtros: ${parts.length > 0 ? parts.join(' · ') : 'Sin filtros'}`
}

export function describeProjectReportFilters(
  filters: ProjectFilters,
  users: readonly User[],
): string[] {
  const parts: string[] = []

  if (filters.search) parts.push(`Búsqueda: “${filters.search}”`)
  if (filters.status !== 'all') {
    parts.push(`Estado: ${STATUS_LABELS[filters.status]}`)
  }
  if (filters.priority !== 'all') {
    parts.push(`Prioridad: ${PRIORITY_LABELS[filters.priority]}`)
  }
  if (filters.sector !== 'all') {
    parts.push(`Sector: ${SECTOR_LABELS[filters.sector]}`)
  }
  if (filters.ownerId) {
    const owner = users.find((user) => user.id === filters.ownerId)
    parts.push(`Responsable: ${owner?.name ?? filters.ownerId}`)
  }
  if (filters.risk !== 'all') {
    parts.push(`Riesgo: ${filters.risk === 'alto' ? 'alto' : 'medio'}`)
  }
  if (filters.archived === 'include') parts.push('Incluye archivados')
  if (filters.archived === 'only') parts.push('Solo archivados')

  return parts
}

export function describeAlertReportFilters(
  filters: AlertFilters,
  projectById: ReadonlyMap<string, Project>,
): string[] {
  const parts: string[] = []

  if (filters.status !== 'all') {
    parts.push(`Estado: ${ALERT_STATUS_LABELS[filters.status]}`)
  }
  if (filters.severity !== 'all') {
    parts.push(`Severidad: ${SEVERITY_LABELS[filters.severity]}`)
  }
  if (filters.projectId) {
    const project = projectById.get(filters.projectId)
    parts.push(
      `Proyecto: ${project ? `${project.code} · ${project.name}` : filters.projectId}`,
    )
  }
  parts.push(`Periodo: ${PERIOD_LABELS[filters.period]}`)

  return parts
}

const PROJECT_COLUMNS: ReportColumn[] = [
  { key: 'code', label: 'Código', kind: 'text' },
  { key: 'name', label: 'Proyecto', kind: 'text' },
  { key: 'client', label: 'Cliente', kind: 'text' },
  { key: 'sector', label: 'Sector', kind: 'text' },
  { key: 'owner', label: 'Responsable', kind: 'text' },
  { key: 'status', label: 'Estado', kind: 'text' },
  { key: 'priority', label: 'Prioridad', kind: 'text' },
  { key: 'progress', label: 'Avance (%)', kind: 'integer' },
  {
    key: 'initialBudget',
    label: 'Presupuesto inicial (PEN)',
    kind: 'currency',
  },
  { key: 'currentBudget', label: 'Presupuesto actual (PEN)', kind: 'currency' },
  { key: 'variation', label: 'Variación (%)', kind: 'percent' },
  { key: 'startDate', label: 'Inicio', kind: 'date' },
  { key: 'dueDate', label: 'Entrega', kind: 'date' },
  { key: 'updatedAt', label: 'Actualizado', kind: 'date' },
  { key: 'archived', label: 'Archivado', kind: 'text' },
]

const ALERT_COLUMNS: ReportColumn[] = [
  { key: 'createdAt', label: 'Fecha', kind: 'date' },
  { key: 'severity', label: 'Severidad', kind: 'text' },
  { key: 'status', label: 'Estado', kind: 'text' },
  { key: 'rule', label: 'Regla', kind: 'text' },
  { key: 'title', label: 'Alerta', kind: 'text' },
  { key: 'project', label: 'Proyecto', kind: 'text' },
  { key: 'description', label: 'Descripción', kind: 'text' },
]

interface ProjectReportInput {
  projects: readonly Project[]
  users: readonly User[]
  filters: string[]
  referenceDate: string
  generatedAt: string
}

export function buildProjectsReport({
  projects,
  users,
  filters,
  referenceDate,
  generatedAt,
}: ProjectReportInput): ReportDocument {
  const userName = new Map(users.map((user) => [user.id, user.name]))

  const rows: ReportRow[] = [...projects]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((project) => ({
      code: project.code,
      name: project.name,
      client: project.client,
      sector: SECTOR_LABELS[project.sector],
      owner: userName.get(project.ownerId) ?? project.ownerId,
      status: STATUS_LABELS[project.status],
      priority: PRIORITY_LABELS[project.priority],
      progress: project.progress,
      initialBudget: project.initialBudgetCents,
      currentBudget: project.currentBudgetCents,
      variation: budgetVariation(project),
      startDate: project.startDate,
      dueDate: project.dueDate,
      updatedAt: project.updatedAt,
      archived: project.archivedAt ? formatDate(project.archivedAt) : 'No',
    }))

  const initialBudget = projects.reduce(
    (total, project) => total + project.initialBudgetCents,
    0,
  )
  const currentBudget = projects.reduce(
    (total, project) => total + project.currentBudgetCents,
    0,
  )

  const metrics: ReportMetric[] = [
    { label: 'Proyectos', value: formatNumber(projects.length) },
    {
      label: 'En ejecución',
      value: formatNumber(
        projects.filter((project) => project.status === 'in_progress').length,
      ),
    },
    {
      label: 'Completados',
      value: formatNumber(
        projects.filter((project) => project.status === 'completed').length,
      ),
    },
    {
      label: 'Bloqueados',
      value: formatNumber(
        projects.filter((project) => project.status === 'on_hold').length,
      ),
    },
    {
      label: 'Vencidos',
      value: formatNumber(
        projects.filter((project) => isOverdue(project, referenceDate)).length,
      ),
    },
    {
      label: 'Presupuesto inicial',
      value: formatCurrency(initialBudget),
    },
    {
      label: 'Presupuesto actual',
      value: formatCurrency(currentBudget),
    },
    {
      label: 'Variación presupuestal',
      value: formatPercentage(percentageChange(initialBudget, currentBudget)),
    },
  ]

  return {
    sheetName: 'Proyectos',
    fileBaseName: `trazo-proyectos-${referenceDate}`,
    metadata: {
      title: 'Trazo · Reporte de proyectos',
      datasetLabel: DEMO_LABEL,
      lines: [
        `Corte: ${formatDate(referenceDate)}`,
        `Generado: ${formatGeneratedAt(generatedAt)}`,
        filterLine(filters),
      ],
    },
    columns: PROJECT_COLUMNS,
    rows,
    metrics,
  }
}

interface AlertReportInput {
  alerts: readonly Alert[]
  projectById: ReadonlyMap<string, Project>
  filters: string[]
  referenceDate: string
  generatedAt: string
}

export function buildAlertsReport({
  alerts,
  projectById,
  filters,
  referenceDate,
  generatedAt,
}: AlertReportInput): ReportDocument {
  const rows: ReportRow[] = [...alerts]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map((alert) => {
      const project = projectById.get(alert.projectId)
      return {
        createdAt: alert.createdAt,
        severity: SEVERITY_LABELS[alert.severity],
        status: ALERT_STATUS_LABELS[alert.status],
        rule: ruleLabel(alert.ruleId),
        title: alert.title,
        project: project
          ? `${project.code} · ${project.name}`
          : alert.projectId,
        description: alert.description,
      }
    })

  const open = alerts.filter((alert) => alert.status === 'open')

  const metrics: ReportMetric[] = [
    { label: 'Alertas', value: formatNumber(alerts.length) },
    { label: 'Abiertas', value: formatNumber(open.length) },
    {
      label: 'Críticas abiertas',
      value: formatNumber(
        open.filter((alert) => alert.severity === 'critical').length,
      ),
    },
    {
      label: 'Revisadas',
      value: formatNumber(
        alerts.filter((alert) => alert.status === 'reviewed').length,
      ),
    },
    {
      label: 'Resueltas',
      value: formatNumber(
        alerts.filter((alert) => alert.status === 'resolved').length,
      ),
    },
    {
      label: 'Proyectos afectados',
      value: formatNumber(new Set(alerts.map((alert) => alert.projectId)).size),
    },
  ]

  return {
    sheetName: 'Alertas',
    fileBaseName: `trazo-alertas-${referenceDate}`,
    metadata: {
      title: 'Trazo · Reporte de alertas',
      datasetLabel: DEMO_LABEL,
      lines: [
        `Corte: ${formatDate(referenceDate)}`,
        `Generado: ${formatGeneratedAt(generatedAt)}`,
        filterLine(filters),
      ],
    },
    columns: ALERT_COLUMNS,
    rows,
    metrics,
  }
}
