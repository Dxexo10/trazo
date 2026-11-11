import { GitCommitHorizontal, History } from 'lucide-react'
import { ChangeValue } from '@/components/shared/change-value'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { SectionCard } from '@/components/shared/section-card'
import { SeverityBadge } from '@/components/shared/severity-badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsers } from '@/features/users/hooks/use-users'
import type { Alert, ChangeEvent, RuleKey } from '@/domain/models'
import { formatDate, formatRelative } from '@/domain/utils/date'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { CHANGE_FIELD_LABELS, RULE_LABELS, SOURCE_LABELS } from '@/lib/labels'
import {
  useProjectAlerts,
  useProjectChanges,
  useProjectVersions,
} from '../hooks/use-project-query'

interface ProjectHistoryTabProps {
  projectId: string
}

function HistorySkeleton() {
  return (
    <SectionCard
      title="Historial de versiones"
      description="Cargando versiones…"
    >
      <div className="space-y-3 px-5 pb-5" aria-busy="true" aria-live="polite">
        <span className="sr-only">Cargando historial…</span>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </SectionCard>
  )
}

export function ProjectHistoryTab({ projectId }: ProjectHistoryTabProps) {
  const versionsQuery = useProjectVersions(projectId)
  const changesQuery = useProjectChanges(projectId)
  const alertsQuery = useProjectAlerts(projectId)
  const { data: users = [] } = useUsers()

  if (versionsQuery.isPending) return <HistorySkeleton />

  if (versionsQuery.isError) {
    return (
      <ErrorState
        message={
          versionsQuery.error instanceof Error
            ? versionsQuery.error.message
            : 'No pudimos cargar el historial del proyecto.'
        }
        onRetry={() => void versionsQuery.refetch()}
      />
    )
  }

  const versions = versionsQuery.data ?? []

  if (versions.length === 0) {
    return (
      <EmptyState
        icon={History}
        title="Sin versiones registradas"
        description="Las ediciones relevantes del proyecto aparecerán aquí."
      />
    )
  }

  const changesByVersion = new Map<string, ChangeEvent[]>()
  for (const change of changesQuery.data ?? []) {
    const bucket = changesByVersion.get(change.versionId)
    if (bucket) {
      bucket.push(change)
    } else {
      changesByVersion.set(change.versionId, [change])
    }
  }

  const alertsByVersion = new Map<string, Alert[]>()
  for (const alert of alertsQuery.data?.items ?? []) {
    if (!alert.versionId) continue
    const bucket = alertsByVersion.get(alert.versionId)
    if (bucket) {
      bucket.push(alert)
    } else {
      alertsByVersion.set(alert.versionId, [alert])
    }
  }

  const usersById = new Map(users.map((user) => [user.id, user]))

  return (
    <SectionCard
      title="Historial de versiones"
      description="Cada edición relevante conserva una instantánea inmutable, el autor y los campos que cambiaron."
      action={
        <span className="rounded-md bg-sand-soft px-2 py-1 text-xs text-muted-foreground">
          {versions.length} {versions.length === 1 ? 'versión' : 'versiones'}
        </span>
      }
    >
      <ol className="px-5 py-2">
        {versions.map((version, index) => {
          const changes = changesByVersion.get(version.id) ?? []
          const alerts = alertsByVersion.get(version.id) ?? []
          const actor = usersById.get(version.changedBy)
          const isLast = index === versions.length - 1

          return (
            <li key={version.id} className="relative flex gap-3 py-4">
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className="absolute top-11 bottom-[-16px] left-[15px] w-px bg-border"
                />
              ) : null}
              <span
                aria-hidden="true"
                className="relative z-10 mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-terracotta-subtle text-brand-terracotta-hover ring-4 ring-surface"
              >
                <GitCommitHorizontal className="size-4" />
              </span>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    Versión {version.versionNumber}
                  </span>
                  <span className="rounded-full border border-border bg-sand-soft px-2 py-0.5 text-[11px] text-muted-foreground">
                    {SOURCE_LABELS[version.source]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(version.changedAt)} ·{' '}
                    {formatRelative(version.changedAt, DEMO_REFERENCE_DATE)}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground">
                  {actor?.name ?? 'Sistema'}
                  {version.reason ? ` · ${version.reason}` : ''}
                </p>

                {changes.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Versión inicial sin cambios en campos auditables.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {changes.map((change) => (
                      <li
                        key={change.id}
                        className="flex flex-wrap items-center gap-1.5 text-xs"
                      >
                        <span className="font-medium text-foreground">
                          {CHANGE_FIELD_LABELS[change.field]}:
                        </span>
                        <ChangeValue
                          field={change.field}
                          value={change.oldValue}
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
                          field={change.field}
                          value={change.newValue}
                          users={users}
                          className="font-medium text-foreground"
                        />
                      </li>
                    ))}
                  </ul>
                )}

                {alerts.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {alerts.map((alert) => (
                      <span
                        key={alert.id}
                        className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
                      >
                        <SeverityBadge
                          severity={alert.severity}
                          showLabel={false}
                          className="px-1.5 py-0"
                        />
                        {RULE_LABELS[alert.ruleId as RuleKey]?.label ??
                          alert.ruleId}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </SectionCard>
  )
}
