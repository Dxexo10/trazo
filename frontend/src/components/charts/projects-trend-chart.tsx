import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TrendPoint } from '@/domain/services/dashboard-summary'
import { formatMonthYear } from '@/domain/utils/date'

interface ProjectsTrendChartProps {
  data: TrendPoint[]
}

export function ProjectsTrendChart({ data }: ProjectsTrendChartProps) {
  const summary = data
    .map(
      (point) =>
        `${formatMonthYear(point.month)}: ${point.created} proyectos creados y ${point.completed} completados.`,
    )
    .join(' ')

  return (
    <>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
        >
          <defs>
            <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            dy={6}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            width={36}
            tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ stroke: 'var(--border)' }}
            contentStyle={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              fontSize: 12,
              boxShadow: 'var(--shadow-raised)',
            }}
            labelFormatter={(label) => String(label).toUpperCase()}
            formatter={(value, name) => [String(value), String(name)]}
          />
          <Area
            type="monotone"
            dataKey="created"
            name="Creados"
            stroke="var(--chart-1)"
            strokeWidth={2}
            fill="url(#createdGradient)"
            activeDot={{ r: 4 }}
          />
          <Area
            type="monotone"
            dataKey="completed"
            name="Completados"
            stroke="var(--chart-2)"
            strokeWidth={2}
            fill="url(#completedGradient)"
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-2 flex flex-wrap items-center gap-4 px-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-chart-1" />
          Proyectos creados
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden="true" className="size-2 rounded-full bg-chart-2" />
          Proyectos completados
        </span>
      </div>

      <p className="sr-only">{summary}</p>
    </>
  )
}
