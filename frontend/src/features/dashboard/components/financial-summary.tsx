import { Link } from 'react-router-dom'
import {
  BellRing,
  Info,
  OctagonAlert,
  TriangleAlert,
  Wallet,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SeveritySlice } from '@/domain/services/dashboard-summary'
import { formatCurrency, formatPercentage } from '@/domain/utils/money'
import { SEVERITY_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface BudgetSummaryCardProps {
  plannedCents: number
  currentCents: number
  variationPct: number | null
}

export function BudgetSummaryCard({
  plannedCents,
  currentCents,
  variationPct,
}: BudgetSummaryCardProps) {
  const ratio =
    plannedCents > 0 ? Math.min((currentCents / plannedCents) * 100, 100) : 100
  const isOverBudget = variationPct !== null && variationPct > 10

  return (
    <Card className="gap-4 p-5">
      <div className="flex items-start justify-between gap-3 px-0">
        <div>
          <p className="text-sm font-medium text-foreground">
            Presupuesto del portafolio
          </p>
          <p className="text-xs text-muted-foreground">
            Línea base vs. presupuesto actual
          </p>
        </div>
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-lg bg-brand-terracotta-subtle text-brand-terracotta-hover"
        >
          <Wallet className="size-4" />
        </span>
      </div>

      <dl className="space-y-2 px-0 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Inicial</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatCurrency(plannedCents)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Actual</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatCurrency(currentCents)}
          </dd>
        </div>
      </dl>

      <div className="space-y-1.5 px-0">
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-[width] duration-300',
              isOverBudget ? 'bg-warning' : 'bg-brand-terracotta',
            )}
            style={{ width: `${ratio}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Variación:{' '}
          <span
            className={cn(
              'font-medium tabular-nums',
              isOverBudget ? 'text-warning' : 'text-foreground',
            )}
          >
            {formatPercentage(variationPct)}
          </span>{' '}
          respecto a la línea base
        </p>
      </div>
    </Card>
  )
}

const SEVERITY_STYLES = {
  critical: {
    icon: OctagonAlert,
    className: 'bg-danger-soft text-danger',
  },
  warning: {
    icon: TriangleAlert,
    className: 'bg-warning-soft text-warning',
  },
  info: {
    icon: Info,
    className: 'bg-info-soft text-info',
  },
} as const

interface AlertsSummaryCardProps {
  slices: SeveritySlice[]
  openAlerts: number
}

export function AlertsSummaryCard({
  slices,
  openAlerts,
}: AlertsSummaryCardProps) {
  return (
    <Card className="gap-4 p-5">
      <div className="flex items-start justify-between gap-3 px-0">
        <div>
          <p className="text-sm font-medium text-foreground">
            Alertas abiertas
          </p>
          <p className="text-xs text-muted-foreground">
            {openAlerts} pendientes de revisión
          </p>
        </div>
        <span
          aria-hidden="true"
          className="inline-flex size-8 items-center justify-center rounded-lg bg-warning-soft text-warning"
        >
          <BellRing className="size-4" />
        </span>
      </div>

      <ul className="space-y-2 px-0">
        {slices.map((slice) => {
          const style = SEVERITY_STYLES[slice.severity]
          const Icon = style.icon

          return (
            <li
              key={slice.severity}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <span
                  aria-hidden="true"
                  className={cn(
                    'inline-flex size-6 items-center justify-center rounded-md',
                    style.className,
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                {SEVERITY_LABELS[slice.severity]}
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {slice.count}
              </span>
            </li>
          )
        })}
      </ul>

      <Link
        to="/alerts"
        className="text-xs font-medium text-brand-terracotta-hover hover:text-brand-terracotta-strong hover:underline"
      >
        Ir al centro de alertas
      </Link>
    </Card>
  )
}
