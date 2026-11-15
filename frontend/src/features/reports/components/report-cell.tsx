import { TrendingDown, TrendingUp } from 'lucide-react'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import type { ProjectPriority, ProjectStatus } from '@/domain/models'
import { formatPercentage } from '@/domain/utils/money'
import { cn } from '@/lib/utils'
import {
  formatReportCell,
  type ReportColumn,
  type ReportRow,
} from '../report-data'

interface ReportCellContentProps {
  column: ReportColumn
  row: ReportRow
}

function variationTone(value: number): {
  className: string
  Icon: typeof TrendingUp
} {
  if (value > 20) {
    return { className: 'bg-danger-soft text-danger', Icon: TrendingUp }
  }
  if (value > 10) {
    return { className: 'bg-warning-soft text-warning', Icon: TrendingUp }
  }
  if (value <= 0) {
    return { className: 'bg-success-soft text-success', Icon: TrendingDown }
  }
  return { className: 'bg-muted text-muted-foreground', Icon: TrendingUp }
}

export function ReportCellContent({ column, row }: ReportCellContentProps) {
  const value = row[column.key]

  switch (column.render) {
    case 'status': {
      if (typeof row.statusKey === 'string') {
        return <StatusBadge status={row.statusKey as ProjectStatus} />
      }
      break
    }

    case 'priority': {
      if (typeof row.priorityKey === 'string') {
        return <PriorityBadge priority={row.priorityKey as ProjectPriority} />
      }
      break
    }

    case 'progress': {
      if (typeof value === 'number') {
        return <ProgressBar value={value} showLabel className="min-w-24" />
      }
      break
    }

    case 'variation': {
      if (typeof value === 'number') {
        const { className, Icon } = variationTone(value)
        return (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 text-xs font-medium tabular-nums',
              className,
            )}
          >
            <Icon aria-hidden="true" className="size-3" />
            {formatPercentage(value)}
          </span>
        )
      }
      break
    }

    case 'dueDate': {
      if (row.overdue) {
        return (
          <span className="inline-flex items-center gap-1.5">
            <span className="font-medium text-danger">
              {formatReportCell(column, value)}
            </span>
            <span className="rounded-full border border-danger/20 bg-danger-soft px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-danger">
              Vencido
            </span>
          </span>
        )
      }
      break
    }
  }

  return <>{formatReportCell(column, value)}</>
}
