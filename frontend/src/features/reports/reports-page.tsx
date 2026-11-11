import { useMemo } from 'react'
import { Download, FileSpreadsheet, Printer } from 'lucide-react'
import { DemoBadge } from '@/components/shared/demo-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { SectionCard } from '@/components/shared/section-card'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DEMO_USERS } from '@/data/mock/seed/users'
import type { AlertFilters } from '@/features/alerts/hooks/use-alert-filters'
import type { ProjectFilters } from '@/features/projects/hooks/use-project-filters'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { formatNumber } from '@/lib/format-number'
import {
  buildAlertsReport,
  buildProjectsReport,
  describeAlertReportFilters,
  describeProjectReportFilters,
  formatReportCell,
  type ReportDocument,
} from './report-data'
import { downloadReportCsv, downloadReportXlsx } from './export/download'
import {
  useAlertReportQuery,
  useProjectReportQuery,
} from './hooks/use-reports-query'
import {
  useReportFilters,
  type ReportFilters,
  type ReportTab,
} from './hooks/use-report-filters'
import { ReportsFilters } from './components/reports-filters'

const PREVIEW_ROWS = 12

function toProjectFilters(filters: ReportFilters): ProjectFilters {
  return {
    search: filters.search,
    status: filters.projectStatus,
    priority: filters.projectPriority,
    sector: filters.projectSector,
    ownerId: filters.ownerId,
    risk: filters.risk,
    archived: filters.archived,
    sortBy: 'updatedAt',
    sortDirection: 'desc',
    page: 1,
  }
}

function toAlertFilters(filters: ReportFilters): AlertFilters {
  return {
    status: filters.alertStatus,
    severity: filters.alertSeverity,
    projectId: filters.alertProjectId,
    period: filters.alertPeriod,
    page: 1,
  }
}

function ReportsSkeleton() {
  return (
    <Card className="gap-3 p-5" aria-busy="true" aria-live="polite">
      <span className="sr-only">Preparando el reporte…</span>
      <Skeleton className="h-5 w-48" />
      <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-2 h-56 w-full rounded-xl" />
    </Card>
  )
}

function ReportSummary({ document }: { document: ReportDocument }) {
  return (
    <SectionCard
      title="Resumen ejecutivo"
      description="Cifras derivadas del mismo estado que el detalle, con los filtros activos."
    >
      <dl className="grid grid-cols-2 gap-3 px-5 pb-5 sm:grid-cols-4">
        {document.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-border/70 bg-sand-soft/50 p-3"
          >
            <dt className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {metric.label}
            </dt>
            <dd className="pt-1 text-lg font-semibold tabular-nums text-foreground">
              {metric.value}
            </dd>
          </div>
        ))}
      </dl>

      <ul className="space-y-1 border-t border-border px-5 py-3 text-xs text-muted-foreground">
        {document.metadata.lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </SectionCard>
  )
}

function ReportPreview({ document }: { document: ReportDocument }) {
  const rows = document.rows.slice(0, PREVIEW_ROWS)

  return (
    <>
      <Table
        label={`${document.metadata.title} (tabla con desplazamiento horizontal)`}
        className="min-w-[820px] text-left"
      >
        <TableCaption className="sr-only">
          {document.metadata.title}
        </TableCaption>
        <TableHeader>
          <TableRow className="border-y border-border/70 bg-sand-soft/60 text-[11px] font-semibold tracking-[0.06em] text-muted-foreground uppercase hover:bg-sand-soft/60">
            {document.columns.map((column) => (
              <TableHead
                key={column.key}
                scope="col"
                className="h-auto py-2 tracking-[0.06em] whitespace-nowrap"
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={index}
              className="border-b border-border/50 align-top last:border-0"
            >
              {document.columns.map((column) => (
                <TableCell
                  key={column.key}
                  className="py-2 align-top text-foreground"
                >
                  {formatReportCell(column, row[column.key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {document.rows.length > rows.length ? (
        <p className="border-t border-border/60 px-5 py-2 text-xs text-muted-foreground">
          Vista previa de {formatNumber(rows.length)} de{' '}
          {formatNumber(document.rows.length)} filas. La exportación incluye
          todas las filas del filtro activo.
        </p>
      ) : null}
    </>
  )
}

export function ReportsPage() {
  const { filters, update, clear } = useReportFilters()
  const projectQuery = useProjectReportQuery(filters)
  const alertQuery = useAlertReportQuery(filters)
  const generatedAt = useMemo(() => new Date().toISOString(), [])

  const activeQuery = filters.tab === 'proyectos' ? projectQuery : alertQuery
  const projects =
    filters.tab === 'proyectos'
      ? (projectQuery.data ?? [])
      : (alertQuery.data?.projects ?? [])

  const document = useMemo<ReportDocument | null>(() => {
    if (filters.tab === 'proyectos') {
      if (!projectQuery.data) return null

      return buildProjectsReport({
        projects: projectQuery.data,
        users: DEMO_USERS,
        filters: describeProjectReportFilters(
          toProjectFilters(filters),
          DEMO_USERS,
        ),
        referenceDate: DEMO_REFERENCE_DATE,
        generatedAt,
      })
    }

    if (!alertQuery.data) return null

    return buildAlertsReport({
      alerts: alertQuery.data.alerts,
      projectById: alertQuery.data.projectById,
      filters: describeAlertReportFilters(
        toAlertFilters(filters),
        alertQuery.data.projectById,
      ),
      referenceDate: DEMO_REFERENCE_DATE,
      generatedAt,
    })
  }, [filters, projectQuery.data, alertQuery.data, generatedAt])

  const hasRows = (document?.rows.length ?? 0) > 0
  const title =
    filters.tab === 'proyectos' ? 'Reporte de proyectos' : 'Reporte de alertas'

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Reportes"
        description="Exporta el portafolio o las alertas con los filtros activos, en CSV o XLSX, y genera un resumen ejecutivo imprimible."
        meta={<DemoBadge />}
        actions={
          <Button
            variant="outline"
            onClick={() => window.print()}
            disabled={!document}
            className="print:hidden"
          >
            <Printer aria-hidden="true" className="size-4" />
            Imprimir / Guardar PDF
          </Button>
        }
      />

      <Tabs
        value={filters.tab}
        onValueChange={(value) => update({ tab: value as ReportTab })}
        className="print:hidden"
      >
        <TabsList aria-label="Tipo de reporte">
          <TabsTrigger value="proyectos">Portafolio</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>
      </Tabs>

      <ReportsFilters
        filters={filters}
        users={DEMO_USERS}
        projects={projects}
        onChange={update}
        onClear={clear}
      />

      {activeQuery.isError ? (
        <ErrorState
          message={
            activeQuery.error instanceof Error
              ? activeQuery.error.message
              : 'No pudimos preparar el reporte.'
          }
          onRetry={() => void activeQuery.refetch()}
        />
      ) : null}

      {activeQuery.isPending ? <ReportsSkeleton /> : null}

      {document ? (
        <>
          <ReportSummary document={document} />

          <SectionCard
            title={title}
            description={
              hasRows
                ? `${formatNumber(document.rows.length)} ${
                    document.rows.length === 1 ? 'fila' : 'filas'
                  } con los filtros activos.`
                : 'No hay filas que coincidan con los filtros activos.'
            }
            action={
              <div className="flex flex-wrap items-center gap-2 print:hidden">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasRows}
                  onClick={() => downloadReportCsv(document)}
                >
                  <Download aria-hidden="true" className="size-3.5" />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasRows}
                  onClick={() => downloadReportXlsx(document)}
                >
                  <FileSpreadsheet aria-hidden="true" className="size-3.5" />
                  XLSX
                </Button>
              </div>
            }
          >
            {hasRows ? (
              <ReportPreview document={document} />
            ) : (
              <EmptyState
                title="Sin datos para exportar"
                description="Ajusta los filtros o cambia de reporte para incluir filas."
              />
            )}
          </SectionCard>

          <p className="text-xs text-muted-foreground print:hidden">
            Los archivos incluyen la fecha de corte, la fecha de generación y la
            etiqueta de datos simulados. El PDF se obtiene con la impresión del
            navegador (Guardar como PDF).
          </p>
        </>
      ) : null}
    </div>
  )
}
