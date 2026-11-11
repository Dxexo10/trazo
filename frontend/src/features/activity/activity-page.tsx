import { Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { DemoBadge } from '@/components/shared/demo-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatNumber } from '@/lib/format-number'
import {
  ACTIVITY_PAGE_SIZE,
  hasActiveActivityFilters,
  useActivityFilters,
} from './hooks/use-activity-filters'
import { useActivityQuery } from './hooks/use-activity-query'
import { ActivityFilters } from './components/activity-filters'
import { ActivityList } from './components/activity-list'

function ActivitySkeleton() {
  return (
    <Card className="gap-3 p-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando actividad…</span>
      <Skeleton className="h-5 w-40" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </Card>
  )
}

export function ActivityPage() {
  const { filters, update, clear } = useActivityFilters()
  const query = useActivityQuery(filters)

  const data = query.data?.page
  const total = data?.total ?? 0
  const items = data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(total / ACTIVITY_PAGE_SIZE))
  const rangeStart =
    total === 0 ? 0 : (filters.page - 1) * ACTIVITY_PAGE_SIZE + 1
  const rangeEnd = Math.min(total, filters.page * ACTIVITY_PAGE_SIZE)
  const active = hasActiveActivityFilters(filters)

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Actividad"
        description="Registro de auditoría de proyectos, versiones y alertas del entorno demo."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <span className="text-xs text-muted-foreground">
              {query.isPending
                ? 'Cargando actividad…'
                : `${formatNumber(total)} ${total === 1 ? 'evento' : 'eventos'}`}
            </span>
          </div>
        }
      />

      {query.isError ? (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : 'No pudimos cargar la actividad.'
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isPending ? <ActivitySkeleton /> : null}

      {query.data ? (
        <>
          <ActivityFilters
            filters={filters}
            projects={query.data.projects}
            users={query.data.users}
            onChange={update}
            onClear={clear}
          />

          <SectionCard
            title={`${formatNumber(total)} ${total === 1 ? 'evento' : 'eventos'}`}
            description={
              active
                ? 'Resultados con los filtros activos.'
                : 'Timeline completo del portafolio activo.'
            }
            action={
              <span className="rounded-md bg-sand-soft px-2 py-1 text-xs text-muted-foreground">
                {formatNumber(ACTIVITY_PAGE_SIZE)} por página
              </span>
            }
          >
            {items.length === 0 ? (
              <EmptyState
                icon={Activity}
                title="Sin actividad para estos filtros"
                description="Prueba con otro proyecto, usuario, acción o periodo."
                action={
                  active ? (
                    <Button variant="outline" size="sm" onClick={clear}>
                      Limpiar filtros
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                <ActivityList
                  activity={items}
                  projects={query.data.projects}
                  users={query.data.users}
                />

                {total > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-3">
                    <p className="text-xs text-muted-foreground">
                      Mostrando {rangeStart}–{rangeEnd} de {formatNumber(total)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page <= 1}
                        onClick={() => update({ page: filters.page - 1 })}
                      >
                        <ChevronLeft aria-hidden="true" className="size-3.5" />
                        Anterior
                      </Button>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        Página {filters.page} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={filters.page >= totalPages}
                        onClick={() => update({ page: filters.page + 1 })}
                      >
                        Siguiente
                        <ChevronRight aria-hidden="true" className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </SectionCard>
        </>
      ) : null}
    </div>
  )
}
