import { FilterX, Search } from 'lucide-react'
import {
  FilterSelect,
  type FilterOption,
} from '@/components/shared/filter-select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ALERT_SEVERITIES,
  ALERT_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SECTORS,
  type Project,
  type User,
} from '@/domain/models'
import {
  ALERT_STATUS_LABELS,
  PRIORITY_LABELS,
  SECTOR_LABELS,
  SEVERITY_LABELS,
  STATUS_LABELS,
} from '@/lib/labels'
import { PERIOD_DAYS } from '@/lib/period'
import {
  hasActiveReportFilters,
  type ReportFilters,
} from '../hooks/use-report-filters'

const ALL: FilterOption = { value: 'all', label: 'Todos' }

const STATUS_OPTIONS: FilterOption[] = [
  ALL,
  ...PROJECT_STATUSES.map((status) => ({
    value: status,
    label: STATUS_LABELS[status],
  })),
]

const PRIORITY_OPTIONS: FilterOption[] = [
  ALL,
  ...PROJECT_PRIORITIES.map((priority) => ({
    value: priority,
    label: PRIORITY_LABELS[priority],
  })),
]

const SECTOR_OPTIONS: FilterOption[] = [
  ALL,
  ...SECTORS.map((sector) => ({
    value: sector,
    label: SECTOR_LABELS[sector],
  })),
]

const RISK_OPTIONS: FilterOption[] = [
  ALL,
  { value: 'alto', label: 'Riesgo alto' },
  { value: 'medio', label: 'Riesgo medio' },
]

const ARCHIVED_OPTIONS: FilterOption[] = [
  { value: 'no', label: 'Ocultar archivados' },
  { value: 'include', label: 'Incluir archivados' },
  { value: 'only', label: 'Solo archivados' },
]

const ALERT_STATUS_OPTIONS: FilterOption[] = [
  ALL,
  ...ALERT_STATUSES.map((status) => ({
    value: status,
    label: ALERT_STATUS_LABELS[status],
  })),
]

const ALERT_SEVERITY_OPTIONS: FilterOption[] = [
  ALL,
  ...ALERT_SEVERITIES.map((severity) => ({
    value: severity,
    label: SEVERITY_LABELS[severity],
  })),
]

const PERIOD_LABELS: Record<(typeof PERIOD_DAYS)[number], string> = {
  '30': 'Últimos 30 días',
  '90': 'Últimos 90 días',
  '365': 'Últimos 12 meses',
  all: 'Todo el historial',
}

const PERIOD_OPTIONS: FilterOption[] = PERIOD_DAYS.map((period) => ({
  value: period,
  label: PERIOD_LABELS[period],
}))

interface ReportsFiltersProps {
  filters: ReportFilters
  users: readonly User[]
  projects: readonly Project[]
  onChange: (patch: Partial<ReportFilters>) => void
  onClear: () => void
}

export function ReportsFilters({
  filters,
  users,
  projects,
  onChange,
  onClear,
}: ReportsFiltersProps) {
  const ownerOptions: FilterOption[] = [
    { value: 'all', label: 'Todos' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ]

  const projectOptions: FilterOption[] = [
    { value: 'all', label: 'Todos los proyectos' },
    ...projects.map((project) => ({
      value: project.id,
      label: `${project.code} · ${project.name}`,
    })),
  ]

  const active = hasActiveReportFilters(filters)

  return (
    <Card className="gap-3 p-4 sm:p-5 print:hidden">
      {filters.tab === 'proyectos' ? (
        <div className="grid grid-cols-2 gap-3 xl:flex xl:flex-wrap xl:items-end">
          <div className="col-span-2 space-y-1.5 xl:min-w-[220px] xl:flex-1">
            <Label htmlFor="report-search" className="sr-only">
              Buscar proyectos
            </Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="report-search"
                type="text"
                value={filters.search}
                onChange={(event) => onChange({ search: event.target.value })}
                placeholder="Nombre, código o cliente"
                className="h-9 bg-surface pl-9"
              />
            </div>
          </div>
          <FilterSelect
            label="Estado"
            value={filters.projectStatus}
            options={STATUS_OPTIONS}
            onChange={(value) =>
              onChange({
                projectStatus: value as ReportFilters['projectStatus'],
              })
            }
            className="xl:w-[140px]"
          />
          <FilterSelect
            label="Prioridad"
            value={filters.projectPriority}
            options={PRIORITY_OPTIONS}
            onChange={(value) =>
              onChange({
                projectPriority: value as ReportFilters['projectPriority'],
              })
            }
            className="xl:w-[140px]"
          />
          <FilterSelect
            label="Sector"
            value={filters.projectSector}
            options={SECTOR_OPTIONS}
            onChange={(value) =>
              onChange({
                projectSector: value as ReportFilters['projectSector'],
              })
            }
            className="xl:w-[150px]"
          />
          <FilterSelect
            label="Responsable"
            value={filters.ownerId || 'all'}
            options={ownerOptions}
            onChange={(value) =>
              onChange({ ownerId: value === 'all' ? '' : value })
            }
            className="xl:w-[160px]"
          />
          <FilterSelect
            label="Riesgo"
            value={filters.risk}
            options={RISK_OPTIONS}
            onChange={(value) =>
              onChange({ risk: value as ReportFilters['risk'] })
            }
            className="xl:w-[140px]"
          />
          <FilterSelect
            label="Archivados"
            value={filters.archived}
            options={ARCHIVED_OPTIONS}
            onChange={(value) =>
              onChange({ archived: value as ReportFilters['archived'] })
            }
            className="col-span-2 xl:w-[170px]"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 xl:flex xl:flex-wrap xl:items-end">
          <FilterSelect
            label="Estado"
            value={filters.alertStatus}
            options={ALERT_STATUS_OPTIONS}
            onChange={(value) =>
              onChange({ alertStatus: value as ReportFilters['alertStatus'] })
            }
            className="xl:w-[150px]"
          />
          <FilterSelect
            label="Severidad"
            value={filters.alertSeverity}
            options={ALERT_SEVERITY_OPTIONS}
            onChange={(value) =>
              onChange({
                alertSeverity: value as ReportFilters['alertSeverity'],
              })
            }
            className="xl:w-[150px]"
          />
          <FilterSelect
            label="Proyecto"
            value={filters.alertProjectId || 'all'}
            options={projectOptions}
            onChange={(value) =>
              onChange({ alertProjectId: value === 'all' ? '' : value })
            }
            className="col-span-2 xl:w-[260px]"
          />
          <FilterSelect
            label="Periodo"
            value={filters.alertPeriod}
            options={PERIOD_OPTIONS}
            onChange={(value) =>
              onChange({ alertPeriod: value as ReportFilters['alertPeriod'] })
            }
            className="xl:w-[170px]"
          />
        </div>
      )}

      {active ? (
        <div className="flex items-center justify-end border-t border-border/60 pt-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="gap-1.5 text-brand-terracotta-hover"
          >
            <FilterX aria-hidden="true" className="size-3.5" />
            Limpiar filtros
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
