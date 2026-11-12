import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SectorBudget } from '@/domain/services/dashboard-summary'
import { formatCompactCurrency, formatCurrency } from '@/domain/utils/money'
import { SECTOR_LABELS } from '@/lib/labels'

interface BudgetComparisonChartProps {
  data: SectorBudget[]
}

export function BudgetComparisonChart({ data }: BudgetComparisonChartProps) {
  const chartData = data.map((entry) => ({
    sector: SECTOR_LABELS[entry.sector],
    initial: entry.initialCents,
    current: entry.currentCents,
  }))

  const summary = data
    .map(
      (entry) =>
        `${SECTOR_LABELS[entry.sector]}: línea base ${formatCurrency(entry.initialCents)}, presupuesto actual ${formatCurrency(entry.currentCents)}.`,
    )
    .join(' ')

  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={chartData}
          margin={{ top: 8, right: 12, bottom: 0, left: -8 }}
          barGap={4}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="sector"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={68}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            tickFormatter={(value: number) => formatCompactCurrency(value)}
          />
          <Tooltip
            cursor={{ fill: 'var(--sand-soft)' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 12,
              boxShadow: 'var(--shadow-raised)',
            }}
            formatter={(value, name) => [
              formatCurrency(Number(value)),
              String(name),
            ]}
          />
          <Bar
            dataKey="initial"
            name="Presupuesto inicial"
            fill="var(--chart-muted)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="current"
            name="Presupuesto actual"
            fill="var(--chart-1)"
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap items-center gap-4 px-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-chart-muted"
          />
          Presupuesto inicial
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-chart-1" />
          Presupuesto actual
        </span>
        <span className="ml-auto">Montos en soles (PEN)</span>
      </div>

      <p className="sr-only">{summary}</p>
    </>
  )
}
