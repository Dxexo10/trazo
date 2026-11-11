import {
  CalendarDays,
  ChevronRight,
  CircleDot,
  CirclePlay,
  Flag,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { ChangeValue } from '@/components/shared/change-value'
import { SeverityBadge } from '@/components/shared/severity-badge'
import { useUsers } from '@/features/users/hooks/use-users'
import type { ChangeType } from '@/domain/models'
import type { ChangeFeedItem } from '@/domain/services/change-feed'
import { formatDate, formatRelative } from '@/domain/utils/date'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { CHANGE_FIELD_LABELS, SOURCE_LABELS } from '@/lib/labels'

const CHANGE_ICONS: Record<ChangeType, LucideIcon> = {
  budget: Wallet,
  deadline: CalendarDays,
  status: CircleDot,
  progress: CirclePlay,
  priority: Flag,
  owner: UserRound,
}

interface ChangeFeedListProps {
  items: readonly ChangeFeedItem[]
  onSelect: (item: ChangeFeedItem) => void
}

export function ChangeFeedList({ items, onSelect }: ChangeFeedListProps) {
  const { data: users = [] } = useUsers()
  const groups = new Map<string, ChangeFeedItem[]>()

  for (const item of items) {
    const key = item.changedAt.slice(0, 10)
    const bucket = groups.get(key)
    if (bucket) {
      bucket.push(item)
    } else {
      groups.set(key, [item])
    }
  }

  return (
    <div>
      {[...groups.entries()].map(([date, groupedItems]) => (
        <div key={date} className="border-t border-border first:border-t-0">
          <div className="flex items-center justify-between bg-sand-soft/40 px-5 py-2">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {formatDate(date)}
            </p>
            <span className="text-[11px] text-muted-foreground">
              {groupedItems.length}{' '}
              {groupedItems.length === 1 ? 'cambio' : 'cambios'}
            </span>
          </div>

          <ul className="divide-y divide-border/70">
            {groupedItems.map((item) => {
              const Icon = CHANGE_ICONS[item.change.field]

              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex w-full items-start gap-3 px-5 py-3 text-left transition-colors hover:bg-sand-soft/60 focus-visible:bg-sand-soft/60 focus-visible:outline-none"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-terracotta-subtle text-brand-terracotta-hover"
                    >
                      <Icon className="size-4" />
                    </span>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {item.project.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {item.project.code} · v{item.version.versionNumber}
                        </span>
                        {item.severity ? (
                          <SeverityBadge
                            severity={item.severity}
                            showLabel={false}
                            className="px-1.5 py-0"
                          />
                        ) : null}
                        <span className="ml-auto hidden text-[11px] text-muted-foreground sm:inline">
                          {SOURCE_LABELS[item.version.source]}
                        </span>
                      </div>

                      <p className="flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="font-medium text-foreground">
                          {CHANGE_FIELD_LABELS[item.change.field]}:
                        </span>
                        <ChangeValue
                          field={item.change.field}
                          value={item.change.oldValue}
                          users={users}
                          className="text-muted-foreground line-through"
                        />
                        <span
                          aria-hidden="true"
                          className="text-muted-foreground"
                        >
                          →
                        </span>
                        <ChangeValue
                          field={item.change.field}
                          value={item.change.newValue}
                          users={users}
                          className="font-medium text-foreground"
                        />
                      </p>

                      <p className="text-[11px] text-muted-foreground">
                        {item.actor?.name ?? 'Sistema'} ·{' '}
                        {formatRelative(item.changedAt, DEMO_REFERENCE_DATE)} ·{' '}
                        {SOURCE_LABELS[item.version.source]}
                      </p>
                    </div>

                    <ChevronRight
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-muted-foreground"
                    />
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
