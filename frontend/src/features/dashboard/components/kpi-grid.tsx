import { CircleCheck, CirclePlay, Layers, TriangleAlert } from 'lucide-react'
import { KpiCard } from '@/components/shared/kpi-card'
import type { DashboardSummary } from '@/domain/services/dashboard-summary'
import { formatNumber } from '@/lib/format-number'

interface KpiGridProps {
  summary: DashboardSummary
}

export function KpiGrid({ summary }: KpiGridProps) {
  const { totals, deltas } = summary

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        label="Total de proyectos"
        value={formatNumber(totals.projects)}
        icon={Layers}
        tone="default"
        delta={deltas.projects}
        href="/projects"
        featured
      />
      <KpiCard
        label="En ejecución"
        value={formatNumber(totals.inProgress)}
        icon={CirclePlay}
        tone="info"
        delta={deltas.inProgress}
        href="/projects?estado=in_progress"
      />
      <KpiCard
        label="Completados"
        value={formatNumber(totals.completed)}
        icon={CircleCheck}
        tone="positive"
        delta={deltas.completed}
        href="/projects?estado=completed"
      />
      <KpiCard
        label="Requieren atención"
        value={formatNumber(totals.attention)}
        icon={TriangleAlert}
        tone="warning"
        delta={deltas.attention}
        lowerIsBetter
        href="/projects?riesgo=alto"
      />
    </div>
  )
}
