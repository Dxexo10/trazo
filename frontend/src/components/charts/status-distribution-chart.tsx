import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { ProjectStatus } from '@/domain/models'
import type { StatusSlice } from '@/domain/services/dashboard-summary'
import { STATUS_LABELS } from '@/lib/labels'

const STATUS_COLORS: Record<ProjectStatus, string> = {
  in_progress: 'var(--chart-1)',
  planned: 'var(--chart-muted)',
  on_hold: 'var(--chart-3)',
  completed: 'var(--chart-2)',
  cancelled: 'var(--chart-4)',
}

interface StatusDistributionChartProps {
  data: StatusSlice[]
}

export function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  const total = data.reduce((sum, slice) => sum + slice.count, 0)
  const visible = data.filter((slice) => slice.count > 0)

  const summary = data
    .map((slice) => `${STATUS_LABELS[slice.status]}: ${slice.count}`)
    .join(', ')

  if (total === 0) {
    return (
      <p className="px-4 py-10 text-center text-sm text-muted-foreground">
        Aún no hay proyectos que coincidan con tus filtros.
      </p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="relative h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={visible}
              dataKey="count"
              nameKey="status"
              innerRadius={58}
              outerRadius={84}
              paddingAngle={2}
              stroke="var(--surface)"
              strokeWidth={2}
            >
              {visible.map((slice) => (
                <Cell key={slice.status} fill={STATUS_COLORS[slice.status]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
                fontSize: 12,
                boxShadow: 'var(--shadow-raised)',
              }}
              formatter={(value, name) => [
                `${String(value)} proyectos`,
                STATUS_LABELS[name as ProjectStatus] ?? String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {total}
          </span>
          <span className="text-xs text-muted-foreground">proyectos</span>
        </div>
      </div>

      <ul className="space-y-1.5 px-3 sm:pr-2">
        {data.map((slice) => (
          <li
            key={slice.status}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[slice.status] }}
              />
              {STATUS_LABELS[slice.status]}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {slice.count}
            </span>
          </li>
        ))}
      </ul>

      <p className="sr-only">{summary}</p>
    </div>
  )
}
