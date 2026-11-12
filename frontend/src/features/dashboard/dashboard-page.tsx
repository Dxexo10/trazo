import { Suspense, lazy } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ChartCard } from '@/components/charts/chart-card'
import { DemoBadge } from '@/components/shared/demo-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/domain/utils/date'
import { formatCompactCurrency, formatCurrency } from '@/domain/utils/money'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { DEMO_CURRENT_USER } from '@/data/mock/seed/users'
import { useDashboardGreeting } from '@/hooks/use-greeting'
import { AttentionTable } from './components/attention-table'
import { DashboardFilters } from './components/dashboard-filters'
import {
  AlertsSummaryCard,
  BudgetSummaryCard,
} from './components/financial-summary'
import { KpiGrid } from './components/kpi-grid'
import { RecentActivity } from './components/recent-activity'
import { parsePeriod, useDashboardFilters } from './hooks/use-dashboard-filters'
import { useDashboardSummary } from './hooks/use-dashboard-summary'

const ProjectsTrendChart = lazy(() =>
  import('@/components/charts/projects-trend-chart').then((module) => ({
    default: module.ProjectsTrendChart,
  })),
)
const StatusDistributionChart = lazy(() =>
  import('@/components/charts/status-distribution-chart').then((module) => ({
    default: module.StatusDistributionChart,
  })),
)
const BudgetComparisonChart = lazy(() =>
  import('@/components/charts/budget-comparison-chart').then((module) => ({
    default: module.BudgetComparisonChart,
  })),
)

function ChartFallback() {
  return <Skeleton className="mx-3 h-[260px] rounded-lg" />
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando información del portafolio…</span>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Card key={index} className="gap-3 p-5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[340px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
      <div className="grid gap-4 xl:grid-cols-3">
        <Skeleton className="h-[340px] rounded-xl xl:col-span-2" />
        <div className="space-y-4">
          <Skeleton className="h-[160px] rounded-xl" />
          <Skeleton className="h-[160px] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { period, setPeriod } = useDashboardFilters()
  const { data, isPending, isError, error, refetch, isFetching } =
    useDashboardSummary(period)

  const summary = data?.summary
  const previousPeriod = parsePeriod(String(period))
  const firstName =
    DEMO_CURRENT_USER.name.split(' ')[0] ?? DEMO_CURRENT_USER.name
  const dashboardGreeting = useDashboardGreeting(firstName)

  return (
    <div className="space-y-5 lg:space-y-7">
      <PageHeader
        title={dashboardGreeting}
        description="Así avanzan tus proyectos."
        meta={
          <div className="flex flex-wrap items-center gap-2">
            <DemoBadge />
            <span className="text-xs text-muted-foreground">
              Datos de referencia al {formatDate(DEMO_REFERENCE_DATE)} ·
              comparación de {previousPeriod} meses
            </span>
          </div>
        }
        actions={
          <>
            <DashboardFilters period={period} onChange={setPeriod} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              aria-label="Actualizar datos del resumen"
              disabled={isFetching}
            >
              <RefreshCw
                aria-hidden="true"
                className={`size-4 ${isFetching ? 'animate-spin' : ''}`}
              />
              Actualizar
            </Button>
            <Button size="sm" render={<Link to="/projects/new" />}>
              <Plus aria-hidden="true" className="size-4" />
              Nuevo proyecto
            </Button>
          </>
        }
      />

      {isError ? (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : 'No pudimos cargar los datos del portafolio desde el entorno demo.'
          }
          onRetry={() => void refetch()}
        />
      ) : null}

      {isPending ? <DashboardSkeleton /> : null}

      {summary && data ? (
        <>
          <KpiGrid summary={summary} />

          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard
              className="xl:col-span-2"
              title="Evolución del portafolio"
              description="Proyectos creados y completados por mes."
              summary={`Serie mensual de ${summary.periodMonths} meses.`}
              action={
                <span className="hidden rounded-md bg-sand-soft px-2 py-1 text-xs text-muted-foreground sm:inline">
                  Últimos {summary.periodMonths} meses
                </span>
              }
            >
              <Suspense fallback={<ChartFallback />}>
                <ProjectsTrendChart data={summary.trend} />
              </Suspense>
            </ChartCard>

            <ChartCard
              title="Distribución por estado"
              description="Composición actual del portafolio."
              summary="Distribución de proyectos por estado."
            >
              <Suspense fallback={<ChartFallback />}>
                <StatusDistributionChart data={summary.statusDistribution} />
              </Suspense>
            </ChartCard>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <ChartCard
              className="xl:col-span-2"
              title="Presupuesto inicial vs. actual"
              description="Comparación de la línea base con el presupuesto vigente por sector."
              summary={`Presupuesto actual del portafolio: ${formatCurrency(summary.totals.currentBudgetCents)}.`}
              action={
                <span className="hidden rounded-md bg-sand-soft px-2 py-1 text-xs text-muted-foreground sm:inline">
                  {formatCompactCurrency(summary.totals.currentBudgetCents)} en
                  ejecución
                </span>
              }
            >
              <Suspense fallback={<ChartFallback />}>
                <BudgetComparisonChart data={summary.sectorBudget} />
              </Suspense>
            </ChartCard>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <BudgetSummaryCard
                plannedCents={summary.totals.plannedBudgetCents}
                currentCents={summary.totals.currentBudgetCents}
                variationPct={summary.budgetVariationPct}
              />
              <AlertsSummaryCard
                slices={summary.alertsBySeverity}
                openAlerts={summary.totals.openAlerts}
              />
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <AttentionTable
                items={summary.attentionProjects}
                users={data.users}
              />
            </div>
            <RecentActivity
              activity={data.activity}
              projects={data.projects}
              users={data.users}
            />
          </div>

          {summary.totals.projects === 0 ? (
            <EmptyState
              title="Aún no hay proyectos que coincidan con tus filtros."
              description="Prueba con un periodo más amplio para ver el portafolio completo."
            />
          ) : null}
        </>
      ) : null}
    </div>
  )
}
