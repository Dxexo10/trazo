import { FilterX } from 'lucide-react'
import {
  FilterSelect,
  type FilterOption,
} from '@/components/shared/filter-select'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  ACTIVITY_SOURCES,
  type ActivitySource,
  type Project,
  type User,
} from '@/domain/models'
import { ACTIVITY_ACTION_LABELS, SOURCE_LABELS } from '@/lib/labels'
import {
  ACTIVITY_PERIODS,
  hasActiveActivityFilters,
  type ActivityFilters as ActivityFiltersState,
} from '../hooks/use-activity-filters'

const ALL: FilterOption = { value: 'all', label: 'Todos' }

const ACTION_OPTIONS: FilterOption[] = [
  ALL,
  ...Object.entries(ACTIVITY_ACTION_LABELS).map(([value, label]) => ({
    value,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  })),
]

const SOURCE_OPTIONS: FilterOption[] = [
  ALL,
  ...ACTIVITY_SOURCES.map((source) => ({
    value: source,
    label: SOURCE_LABELS[source],
  })),
]

const PERIOD_LABELS: Record<(typeof ACTIVITY_PERIODS)[number], string> = {
  '30': 'Últimos 30 días',
  '90': 'Últimos 90 días',
  '365': 'Últimos 12 meses',
  all: 'Todo el historial',
}

const PERIOD_OPTIONS: FilterOption[] = ACTIVITY_PERIODS.map((period) => ({
  value: period,
  label: PERIOD_LABELS[period],
}))

interface ActivityFiltersProps {
  filters: ActivityFiltersState
  projects: readonly Project[]
  users: readonly User[]
  onChange: (patch: Partial<ActivityFiltersState>) => void
  onClear: () => void
}

export function ActivityFilters({
  filters,
  projects,
  users,
  onChange,
  onClear,
}: ActivityFiltersProps) {
  const projectOptions: FilterOption[] = [
    { value: 'all', label: 'Todos los proyectos' },
    ...projects.map((project) => ({
      value: project.id,
      label: `${project.code} · ${project.name}`,
    })),
  ]

  const actorOptions: FilterOption[] = [
    { value: 'all', label: 'Todos los usuarios' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ]

  const active = hasActiveActivityFilters(filters)

  return (
    <Card className="gap-3 p-4 sm:p-5">
      <div className="grid grid-cols-2 gap-3 xl:flex xl:flex-wrap xl:items-end">
        <FilterSelect
          label="Proyecto"
          value={filters.projectId || 'all'}
          options={projectOptions}
          onChange={(projectId) =>
            onChange({ projectId: projectId === 'all' ? '' : projectId })
          }
          className="col-span-2 xl:w-[240px]"
        />
        <FilterSelect
          label="Usuario"
          value={filters.actorId || 'all'}
          options={actorOptions}
          onChange={(actorId) =>
            onChange({ actorId: actorId === 'all' ? '' : actorId })
          }
          className="xl:w-[170px]"
        />
        <FilterSelect
          label="Acción"
          value={filters.action}
          options={ACTION_OPTIONS}
          onChange={(action) => onChange({ action })}
          className="col-span-2 xl:w-[190px]"
        />
        <FilterSelect
          label="Origen"
          value={filters.source}
          options={SOURCE_OPTIONS}
          onChange={(source) =>
            onChange({ source: source as ActivitySource | 'all' })
          }
          className="xl:w-[140px]"
        />
        <FilterSelect
          label="Periodo"
          value={filters.period}
          options={PERIOD_OPTIONS}
          onChange={(period) =>
            onChange({ period: period as ActivityFiltersState['period'] })
          }
          className="xl:w-[170px]"
        />
      </div>

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
