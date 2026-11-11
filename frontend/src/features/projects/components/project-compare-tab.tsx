import { useState } from 'react'
import { GitCompareArrows } from 'lucide-react'
import { ChangeValue } from '@/components/shared/change-value'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { FilterSelect } from '@/components/shared/filter-select'
import { SectionCard } from '@/components/shared/section-card'
import { SeverityBadge } from '@/components/shared/severity-badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useUsers } from '@/features/users/hooks/use-users'
import type { RuleKey } from '@/domain/models'
import { diffProject } from '@/domain/services/project-diff'
import { formatDate } from '@/domain/utils/date'
import { CHANGE_FIELD_LABELS, RULE_LABELS } from '@/lib/labels'
import {
  useProjectAlerts,
  useProjectVersions,
} from '../hooks/use-project-query'

interface ProjectCompareTabProps {
  projectId: string
}

export function ProjectCompareTab({ projectId }: ProjectCompareTabProps) {
  const versionsQuery = useProjectVersions(projectId)
  const alertsQuery = useProjectAlerts(projectId)
  const { data: users = [] } = useUsers()
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const versions = versionsQuery.data ?? []
  const defaultToId = versions[0]?.id ?? ''
  const defaultFromId = versions[1]?.id ?? ''
  const selectedToId = versions.some((version) => version.id === toId)
    ? toId
    : defaultToId
  const selectedFromId =
    versions.some((version) => version.id === fromId) && fromId !== selectedToId
      ? fromId
      : defaultFromId

  if (versionsQuery.isPending) {
    return (
      <SectionCard title="Comparar versiones" description="Cargando versiones…">
        <div
          className="space-y-3 px-5 pb-5"
          aria-busy="true"
          aria-live="polite"
        >
          <span className="sr-only">Cargando comparador…</span>
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </SectionCard>
    )
  }

  if (versionsQuery.isError) {
    return (
      <ErrorState
        message={
          versionsQuery.error instanceof Error
            ? versionsQuery.error.message
            : 'No pudimos cargar las versiones del proyecto.'
        }
        onRetry={() => void versionsQuery.refetch()}
      />
    )
  }

  if (versions.length < 2) {
    return (
      <EmptyState
        icon={GitCompareArrows}
        title="Aún no hay dos versiones para comparar"
        description="Edita el proyecto para registrar una nueva versión y habilitar la comparación."
      />
    )
  }

  const options = versions.map((version) => ({
    value: version.id,
    label: `Versión ${version.versionNumber} · ${formatDate(version.changedAt)}`,
  }))

  const fromVersion = versions.find((version) => version.id === selectedFromId)
  const toVersion = versions.find((version) => version.id === selectedToId)
  const differences =
    fromVersion && toVersion
      ? diffProject(fromVersion.snapshot, toVersion.snapshot)
      : []

  const targetAlerts = (alertsQuery.data?.items ?? []).filter(
    (alert) => alert.versionId === toVersion?.id,
  )

  return (
    <SectionCard
      title="Comparar versiones"
      description="Selecciona dos instantáneas para ver qué cambió entre ellas."
    >
      <div className="space-y-4 px-5 pb-5">
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            label="Desde"
            value={selectedFromId}
            options={options}
            onChange={setFromId}
            className="w-[230px]"
          />
          <FilterSelect
            label="Hasta"
            value={selectedToId}
            options={options}
            onChange={setToId}
            className="w-[230px]"
          />
        </div>

        {differences.length === 0 ? (
          <EmptyState
            icon={GitCompareArrows}
            title="Sin diferencias"
            description="Estas dos versiones tienen los mismos valores en los campos auditables."
          />
        ) : (
          <div className="rounded-xl border border-border">
            <Table label="Diferencias entre versiones">
              <TableHeader>
                <TableRow>
                  <TableHead>Campo</TableHead>
                  <TableHead>Antes</TableHead>
                  <TableHead>Después</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {differences.map((difference) => (
                  <TableRow key={difference.field}>
                    <TableCell className="font-medium text-foreground">
                      {CHANGE_FIELD_LABELS[difference.field]}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <ChangeValue
                        field={difference.field}
                        value={difference.oldValue}
                        users={users}
                      />
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      <ChangeValue
                        field={difference.field}
                        value={difference.newValue}
                        users={users}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {targetAlerts.length > 0 ? (
          <div className="rounded-xl border border-border bg-sand-soft/60 p-3">
            <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              Reglas disparadas por la versión {toVersion?.versionNumber}
            </p>
            <ul className="mt-2 space-y-2">
              {targetAlerts.map((alert) => {
                const rule = RULE_LABELS[alert.ruleId as RuleKey]
                return (
                  <li key={alert.id} className="flex gap-2">
                    <SeverityBadge
                      severity={alert.severity}
                      showLabel={false}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground">
                        {rule?.label ?? alert.ruleId}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {rule?.description ?? alert.description}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Esta versión no disparó reglas de alerta.
          </p>
        )}
      </div>
    </SectionCard>
  )
}
