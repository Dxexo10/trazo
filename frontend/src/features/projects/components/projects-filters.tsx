import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { PRIORITY_LABELS, SECTOR_LABELS, STATUS_LABELS } from '@/lib/labels'
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SECTORS,
  type User,
} from '@/domain/models'
import {
  hasActiveFilters,
  type ProjectFilters,
} from '../hooks/use-project-filters'
import {
  FilterSelect,
  type FilterOption,
} from '@/components/shared/filter-select'

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

interface FilterChipProps {
  label: string
  onRemove: () => void
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <span className="inline-flex max-w-full items-center gap-1 rounded-full border border-border bg-sand-soft py-1 pr-1.5 pl-2.5 text-xs text-foreground">
      <span className="max-w-[200px] truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar filtro ${label}`}
        className="inline-flex size-4 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-terracotta"
      >
        <X aria-hidden="true" className="size-3" />
      </button>
    </span>
  )
}

interface ProjectsFiltersProps {
  filters: ProjectFilters
  users: readonly User[]
  onChange: (patch: Partial<ProjectFilters>) => void
  onClear: () => void
}

export function ProjectsFilters({
  filters,
  users,
  onChange,
  onClear,
}: ProjectsFiltersProps) {
  const ownerOptions: FilterOption[] = [
    { value: 'all', label: 'Todos' },
    ...users.map((user) => ({ value: user.id, label: user.name })),
  ]

  const ownerName = users.find((user) => user.id === filters.ownerId)?.name

  const chips: { key: string; label: string; clear: () => void }[] = []

  if (filters.search) {
    chips.push({
      key: 'search',
      label: `Búsqueda: “${filters.search}”`,
      clear: () => onChange({ search: '' }),
    })
  }
  if (filters.status !== 'all') {
    chips.push({
      key: 'status',
      label: `Estado: ${STATUS_LABELS[filters.status]}`,
      clear: () => onChange({ status: 'all' }),
    })
  }
  if (filters.priority !== 'all') {
    chips.push({
      key: 'priority',
      label: `Prioridad: ${PRIORITY_LABELS[filters.priority]}`,
      clear: () => onChange({ priority: 'all' }),
    })
  }
  if (filters.sector !== 'all') {
    chips.push({
      key: 'sector',
      label: `Sector: ${SECTOR_LABELS[filters.sector]}`,
      clear: () => onChange({ sector: 'all' }),
    })
  }
  if (ownerName) {
    chips.push({
      key: 'owner',
      label: `Responsable: ${ownerName}`,
      clear: () => onChange({ ownerId: '' }),
    })
  }
  if (filters.risk !== 'all') {
    chips.push({
      key: 'risk',
      label: `Riesgo: ${filters.risk === 'alto' ? 'alto' : 'medio'}`,
      clear: () => onChange({ risk: 'all' }),
    })
  }
  if (filters.archived !== 'no') {
    chips.push({
      key: 'archived',
      label:
        filters.archived === 'only' ? 'Solo archivados' : 'Incluye archivados',
      clear: () => onChange({ archived: 'no' }),
    })
  }

  const moreFiltersCount =
    (filters.ownerId ? 1 : 0) +
    (filters.risk !== 'all' ? 1 : 0) +
    (filters.archived !== 'no' ? 1 : 0)
  const appliedFilterCount = chips.length - (filters.search ? 1 : 0)
  const active = hasActiveFilters(filters)

  return (
    <Card className="gap-4 p-4 sm:p-5">
      <div role="search">
        <Label htmlFor="project-search" className="sr-only">
          Buscar proyectos
        </Label>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="project-search"
            type="text"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Nombre, código o cliente"
            className="h-11 bg-surface pr-10 pl-10 text-base md:text-sm"
          />
          {filters.search ? (
            <button
              type="button"
              onClick={() => onChange({ search: '' })}
              aria-label="Limpiar búsqueda"
              className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-terracotta"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full justify-between"
              />
            }
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal aria-hidden="true" className="size-4" />
              Filtros
            </span>
            {appliedFilterCount > 0 ? (
              <span className="rounded-full bg-brand-terracotta/15 px-2 py-0.5 text-[11px] font-semibold text-brand-terracotta-hover">
                {appliedFilterCount}
              </span>
            ) : (
              <ChevronDown
                aria-hidden="true"
                className="size-4 text-muted-foreground"
              />
            )}
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="gap-0 rounded-t-2xl p-0 sm:max-w-none"
          >
            <SheetHeader className="border-b border-border px-5 pt-5 pb-4">
              <SheetTitle>Filtros</SheetTitle>
              <SheetDescription>
                Acota el portafolio por estado, prioridad y contexto.
              </SheetDescription>
            </SheetHeader>

            <div className="grid grid-cols-2 gap-3 px-5 py-4">
              <FilterSelect
                label="Estado"
                value={filters.status}
                options={STATUS_OPTIONS}
                onChange={(status) =>
                  onChange({ status: status as ProjectFilters['status'] })
                }
              />
              <FilterSelect
                label="Prioridad"
                value={filters.priority}
                options={PRIORITY_OPTIONS}
                onChange={(priority) =>
                  onChange({ priority: priority as ProjectFilters['priority'] })
                }
              />
              <FilterSelect
                label="Sector"
                value={filters.sector}
                options={SECTOR_OPTIONS}
                onChange={(sector) =>
                  onChange({ sector: sector as ProjectFilters['sector'] })
                }
              />
              <FilterSelect
                label="Responsable"
                value={filters.ownerId || 'all'}
                options={ownerOptions}
                onChange={(ownerId) =>
                  onChange({ ownerId: ownerId === 'all' ? '' : ownerId })
                }
              />
              <FilterSelect
                label="Riesgo"
                value={filters.risk}
                options={RISK_OPTIONS}
                onChange={(risk) =>
                  onChange({ risk: risk as ProjectFilters['risk'] })
                }
              />
              <div className="col-span-2">
                <FilterSelect
                  label="Archivados"
                  value={filters.archived}
                  options={ARCHIVED_OPTIONS}
                  onChange={(archived) =>
                    onChange({
                      archived: archived as ProjectFilters['archived'],
                    })
                  }
                />
              </div>
            </div>

            <SheetFooter className="flex-row items-center justify-between gap-3 border-t border-border px-5 py-4">
              <Button
                type="button"
                variant="ghost"
                disabled={!active}
                onClick={onClear}
              >
                Limpiar
              </Button>
              <SheetClose render={<Button type="button" />}>
                Ver resultados
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden flex-wrap items-end gap-2 border-t border-border/60 pt-3 sm:flex">
        <FilterSelect
          label="Estado"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(status) =>
            onChange({ status: status as ProjectFilters['status'] })
          }
          className="w-[132px]"
        />
        <FilterSelect
          label="Prioridad"
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(priority) =>
            onChange({ priority: priority as ProjectFilters['priority'] })
          }
          className="w-[132px]"
        />
        <FilterSelect
          label="Sector"
          value={filters.sector}
          options={SECTOR_OPTIONS}
          onChange={(sector) =>
            onChange({ sector: sector as ProjectFilters['sector'] })
          }
          className="w-[140px]"
        />

        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-9 gap-1.5 px-3"
              />
            }
          >
            <SlidersHorizontal aria-hidden="true" className="size-4" />
            Más filtros
            {moreFiltersCount > 0 ? (
              <span className="rounded-full bg-brand-terracotta/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-terracotta-hover">
                {moreFiltersCount}
              </span>
            ) : null}
          </PopoverTrigger>
          <PopoverContent align="start" className="w-72 gap-3 p-3">
            <div className="space-y-3">
              <FilterSelect
                label="Responsable"
                value={filters.ownerId || 'all'}
                options={ownerOptions}
                onChange={(ownerId) =>
                  onChange({ ownerId: ownerId === 'all' ? '' : ownerId })
                }
              />
              <FilterSelect
                label="Riesgo"
                value={filters.risk}
                options={RISK_OPTIONS}
                onChange={(risk) =>
                  onChange({ risk: risk as ProjectFilters['risk'] })
                }
              />
              <FilterSelect
                label="Archivados"
                value={filters.archived}
                options={ARCHIVED_OPTIONS}
                onChange={(archived) =>
                  onChange({ archived: archived as ProjectFilters['archived'] })
                }
              />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
          {chips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              onRemove={chip.clear}
            />
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-7 gap-1.5 px-2 text-brand-terracotta-hover"
          >
            <X aria-hidden="true" className="size-3.5" />
            Limpiar todo
          </Button>
        </div>
      ) : null}
    </Card>
  )
}
