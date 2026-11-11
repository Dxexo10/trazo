import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, FolderSearch, Plus } from 'lucide-react'
import { DemoBadge } from '@/components/shared/demo-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsers } from '@/features/users/hooks/use-users'
import { formatNumber } from '@/lib/format-number'
import {
  hasActiveFilters,
  PROJECTS_PAGE_SIZE,
  useProjectFilters,
} from './hooks/use-project-filters'
import { useProjectsQuery } from './hooks/use-projects-query'
import { ProjectMobileList } from './components/project-mobile-list'
import { ProjectsFilters } from './components/projects-filters'
import { ProjectsSort } from './components/projects-sort'
import { ProjectsTable } from './components/projects-table'

function ProjectsSkeleton() {
  return (
    <Card className="gap-3 p-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando proyectos…</span>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-64" />
      <div className="space-y-2 pt-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </Card>
  )
}

export function ProjectsPage() {
  const { filters, update, clear } = useProjectFilters()
  const query = useProjectsQuery(filters)
  const { data: users = [] } = useUsers()
  const total = query.data?.total ?? 0
  const items = query.data?.items ?? []
  const totalPages = Math.max(1, Math.ceil(total / PROJECTS_PAGE_SIZE))
  const rangeStart =
    total === 0 ? 0 : (filters.page - 1) * PROJECTS_PAGE_SIZE + 1
  const rangeEnd = Math.min(total, filters.page * PROJECTS_PAGE_SIZE)
  const active = hasActiveFilters(filters)
  const onlyArchived = filters.archived === 'only'

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={onlyArchived ? 'Proyectos archivados' : 'Proyectos'}
        description={
          onlyArchived
            ? 'Proyectos fuera del portafolio activo. Sus datos e historial se conservan.'
            : 'Explora, filtra y gestiona el portafolio completo.'
        }
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <span className="text-xs text-muted-foreground">
              {query.isPending
                ? 'Cargando portafolio…'
                : `${formatNumber(total)} ${total === 1 ? 'resultado' : 'resultados'}`}
            </span>
          </div>
        }
        actions={
          <Button render={<Link to="/projects/new" />}>
            <Plus aria-hidden="true" className="size-4" />
            Nuevo proyecto
          </Button>
        }
      />

      <ProjectsFilters
        filters={filters}
        users={users}
        onChange={update}
        onClear={clear}
      />

      {query.isError ? (
        <ErrorState
          message={
            query.error instanceof Error
              ? query.error.message
              : 'No pudimos cargar los proyectos desde el entorno demo.'
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.isPending ? <ProjectsSkeleton /> : null}

      {query.data ? (
        <>
          <SectionCard
            title={`${formatNumber(total)} ${total === 1 ? 'proyecto' : 'proyectos'}`}
            description={
              active
                ? 'Resultados con los filtros activos.'
                : 'Portafolio activo ordenado por actualización reciente.'
            }
            action={
              <span className="rounded-md bg-sand-soft px-2 py-1 text-xs text-muted-foreground">
                {formatNumber(PROJECTS_PAGE_SIZE)} por página
              </span>
            }
          >
            {items.length === 0 ? (
              <EmptyState
                icon={FolderSearch}
                title={
                  onlyArchived
                    ? 'Todavía no hay proyectos archivados'
                    : 'No encontramos proyectos'
                }
                description={
                  onlyArchived
                    ? 'Cuando archives un proyecto desde su menú de acciones aparecerá aquí, con su historial intacto.'
                    : 'Prueba con otros filtros o crea el primer proyecto del portafolio.'
                }
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    {active ? (
                      <Button variant="outline" size="sm" onClick={clear}>
                        {onlyArchived
                          ? 'Ver portafolio activo'
                          : 'Limpiar filtros'}
                      </Button>
                    ) : null}
                    <Button size="sm" render={<Link to="/projects/new" />}>
                      <Plus aria-hidden="true" className="size-3.5" />
                      Nuevo proyecto
                    </Button>
                  </div>
                }
              />
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-5 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    {active ? 'Resultados filtrados' : 'Portafolio completo'}
                  </p>
                  <ProjectsSort
                    sortBy={filters.sortBy}
                    sortDirection={filters.sortDirection}
                    onChange={update}
                  />
                </div>
                <div className="hidden md:block">
                  <ProjectsTable projects={items} users={users} />
                </div>
                <div className="md:hidden">
                  <ProjectMobileList projects={items} users={users} />
                </div>
              </>
            )}
          </SectionCard>

          {total > 0 ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
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
      ) : null}
    </div>
  )
}
