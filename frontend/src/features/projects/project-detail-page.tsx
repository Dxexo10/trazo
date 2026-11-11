import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  Archive,
  ArrowLeft,
  BellRing,
  CalendarDays,
  CirclePlay,
  FolderSearch,
  PencilLine,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { DemoBadge } from '@/components/shared/demo-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { KpiCard } from '@/components/shared/kpi-card'
import { PageHeader } from '@/components/shared/page-header'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { SectionCard } from '@/components/shared/section-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserChip } from '@/components/shared/user-chip'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUsers } from '@/features/users/hooks/use-users'
import type { AlertSeverity } from '@/domain/models'
import { isOverdue } from '@/domain/services/project-metrics'
import { formatDate, formatRelative } from '@/domain/utils/date'
import {
  formatCurrency,
  formatPercentage,
  percentageChange,
} from '@/domain/utils/money'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import {
  ALERT_STATUS_LABELS,
  SEVERITY_LABELS,
  SECTOR_LABELS,
} from '@/lib/labels'
import { cn } from '@/lib/utils'
import { ArchiveProjectButton } from './components/archive-project-button'
import { ProjectCompareTab } from './components/project-compare-tab'
import { ProjectHistoryTab } from './components/project-history-tab'
import { useProjectActivity } from './hooks/use-project-query'
import { useProjectAlerts, useProjectQuery } from './hooks/use-project-query'
import { RecentActivity } from '@/features/dashboard/components/recent-activity'

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: 'bg-danger-soft text-danger',
  warning: 'bg-warning-soft text-warning',
  info: 'bg-info-soft text-info',
}

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando proyecto…</span>
      <Skeleton className="h-9 w-72" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  )
}

const DETAIL_TABS = ['resumen', 'historial', 'comparar'] as const
type DetailTab = (typeof DETAIL_TABS)[number]

function resolveTab(value: string | null): DetailTab {
  return DETAIL_TABS.includes(value as DetailTab)
    ? (value as DetailTab)
    : 'resumen'
}

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const projectQuery = useProjectQuery(id)
  const alertsQuery = useProjectAlerts(id)
  const activityQuery = useProjectActivity(id)
  const { data: users = [] } = useUsers()
  const activeTab = resolveTab(searchParams.get('tab'))

  const changeTab = (next: string) => {
    const params = new URLSearchParams(searchParams)
    if (next === 'resumen') {
      params.delete('tab')
    } else {
      params.set('tab', next)
    }
    setSearchParams(params, { replace: true })
  }

  if (projectQuery.isPending) return <DetailSkeleton />

  if (projectQuery.isError) {
    return (
      <ErrorState
        message={
          projectQuery.error instanceof Error
            ? projectQuery.error.message
            : 'No pudimos cargar el proyecto.'
        }
        onRetry={() => void projectQuery.refetch()}
      />
    )
  }

  const project = projectQuery.data

  if (!project) {
    return (
      <EmptyState
        icon={FolderSearch}
        title="Proyecto no encontrado"
        description="Puede que ya no exista o que el enlace sea incorrecto."
        action={
          <Button variant="outline" size="sm" render={<Link to="/projects" />}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al listado
          </Button>
        }
      />
    )
  }

  const owner = users.find((user) => user.id === project.ownerId)
  const alerts = alertsQuery.data?.items ?? []
  const openAlerts = alerts.filter((alert) => alert.status === 'open')
  const variation = percentageChange(
    project.initialBudgetCents,
    project.currentBudgetCents,
  )
  const overdue = isOverdue(project, DEMO_REFERENCE_DATE)
  const variationTone =
    variation === null
      ? 'default'
      : variation > 20
        ? 'danger'
        : variation > 10
          ? 'warning'
          : variation <= 0
            ? 'positive'
            : 'default'

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title={project.name}
        description={`${project.code} · ${project.client} · ${SECTOR_LABELS[project.sector]}`}
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
            {project.archivedAt ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-sand-soft px-2 py-0.5 text-xs font-medium text-muted-foreground">
                <Archive aria-hidden="true" className="size-3.5" />
                Archivado
              </span>
            ) : null}
          </div>
        }
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              render={<Link to="/projects" />}
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              Portafolio
            </Button>
            <Button
              size="sm"
              render={<Link to={`/projects/${project.id}/edit`} />}
            >
              <PencilLine aria-hidden="true" className="size-4" />
              Editar
            </Button>
            {project.archivedAt ? null : (
              <ArchiveProjectButton
                project={project}
                size="default"
                onArchived={() => navigate('/projects')}
              />
            )}
          </>
        }
      />

      {project.archivedAt ? (
        <div className="flex items-start gap-2 rounded-2xl border border-border bg-sand-soft px-4 py-3 text-sm text-muted-foreground">
          <Archive aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Este proyecto fue archivado el {formatDate(project.archivedAt)}. Sus
          datos se conservan y puedes consultarlo con “Incluir archivados”.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Presupuesto actual"
          value={formatCurrency(project.currentBudgetCents)}
          icon={Wallet}
          tone="default"
          hint={`Línea base: ${formatCurrency(project.initialBudgetCents)}`}
        />
        <KpiCard
          label="Variación presupuestal"
          value={formatPercentage(variation)}
          icon={variation !== null && variation < 0 ? TrendingDown : TrendingUp}
          tone={variationTone}
          hint="Respecto al presupuesto inicial"
        />
        <KpiCard
          label="Avance"
          value={`${project.progress} %`}
          icon={CirclePlay}
          tone={project.progress === 100 ? 'positive' : 'info'}
          hint="Progreso reportado por el responsable"
        />
        <KpiCard
          label="Fecha de entrega"
          value={formatDate(project.dueDate)}
          icon={CalendarDays}
          tone={overdue ? 'danger' : 'default'}
          hint={
            overdue
              ? 'Entrega vencida; requiere seguimiento'
              : `Inicio: ${formatDate(project.startDate)}`
          }
        />
      </div>

      <Tabs value={activeTab} onValueChange={changeTab} className="gap-4">
        <TabsList className="bg-sand-soft">
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
          <TabsTrigger value="comparar">Comparar versiones</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-3">
            <div className="space-y-4 xl:col-span-2">
              <SectionCard
                title="Alcance del proyecto"
                description="Contexto, responsables y cronograma vigente."
              >
                <div className="space-y-4 px-5 pb-5">
                  <p className="text-sm leading-relaxed text-foreground">
                    {project.description}
                  </p>

                  {project.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-sand-soft px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <dl className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Responsable
                      </dt>
                      <dd className="pt-1">
                        {owner ? (
                          <UserChip name={owner.name} />
                        ) : (
                          <span className="text-muted-foreground">
                            Sin asignar
                          </span>
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Cliente</dt>
                      <dd className="pt-1 font-medium text-foreground">
                        {project.client}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Inicio</dt>
                      <dd className="pt-1 font-medium tabular-nums text-foreground">
                        {formatDate(project.startDate)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Entrega</dt>
                      <dd
                        className={cn(
                          'pt-1 font-medium tabular-nums',
                          overdue ? 'text-danger' : 'text-foreground',
                        )}
                      >
                        {formatDate(project.dueDate)}
                      </dd>
                    </div>
                    {project.completedAt ? (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Cierre real
                        </dt>
                        <dd className="pt-1 font-medium tabular-nums text-foreground">
                          {formatDate(project.completedAt)}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </SectionCard>

              <SectionCard
                title="Presupuesto y avance"
                description="Línea base, presupuesto vigente y progreso reportado."
              >
                <div className="space-y-4 px-5 pb-5">
                  <dl className="grid gap-3 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-xs text-muted-foreground">Inicial</dt>
                      <dd className="pt-1 font-medium tabular-nums text-foreground">
                        {formatCurrency(project.initialBudgetCents)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">Actual</dt>
                      <dd className="pt-1 font-medium tabular-nums text-foreground">
                        {formatCurrency(project.currentBudgetCents)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Variación
                      </dt>
                      <dd className="pt-1 font-medium tabular-nums text-foreground">
                        {formatPercentage(variation)}
                      </dd>
                    </div>
                  </dl>
                  <ProgressBar
                    value={project.progress}
                    showLabel
                    label={`Avance de ${project.name}`}
                  />
                </div>
              </SectionCard>
            </div>

            <SectionCard
              title="Alertas del proyecto"
              description="Señales generadas a partir de las reglas demo."
              action={
                <Link
                  to="/alerts"
                  className="text-xs font-medium text-brand-terracotta-hover hover:underline"
                >
                  Centro de alertas
                </Link>
              }
            >
              {alerts.length === 0 ? (
                <EmptyState
                  icon={BellRing}
                  title="Sin alertas"
                  description="Este proyecto no tiene alertas registradas."
                />
              ) : (
                <ul className="divide-y divide-border">
                  {alerts.slice(0, 5).map((alert) => (
                    <li key={alert.id} className="flex gap-3 px-5 py-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-lg',
                          SEVERITY_STYLES[alert.severity],
                        )}
                      >
                        <BellRing className="size-3.5" />
                      </span>
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-sm font-medium text-foreground">
                          {alert.title}
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {alert.description}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {SEVERITY_LABELS[alert.severity]} ·{' '}
                          {ALERT_STATUS_LABELS[alert.status]} ·{' '}
                          {formatRelative(alert.createdAt, DEMO_REFERENCE_DATE)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {openAlerts.length > 0 ? (
                <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
                  {openAlerts.length}{' '}
                  {openAlerts.length === 1
                    ? 'alerta abierta'
                    : 'alertas abiertas'}{' '}
                  pendientes de revisión.
                </div>
              ) : null}
            </SectionCard>
          </div>

          {activityQuery.data ? (
            <RecentActivity
              activity={activityQuery.data.items}
              projects={[project]}
              users={users}
            />
          ) : null}
        </TabsContent>

        <TabsContent value="historial">
          <ProjectHistoryTab projectId={project.id} />
        </TabsContent>

        <TabsContent value="comparar">
          <ProjectCompareTab projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
