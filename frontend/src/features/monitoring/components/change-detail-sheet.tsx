import { ArrowRight, GitCompareArrows, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ChangeValue } from '@/components/shared/change-value'
import { SeverityBadge } from '@/components/shared/severity-badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useUsers } from '@/features/users/hooks/use-users'
import type { RuleKey } from '@/domain/models'
import type { ChangeFeedItem } from '@/domain/services/change-feed'
import { formatDate, formatRelative } from '@/domain/utils/date'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { CHANGE_FIELD_LABELS, RULE_LABELS, SOURCE_LABELS } from '@/lib/labels'

interface ChangeDetailSheetProps {
  item: ChangeFeedItem | null
  onClose: () => void
}

export function ChangeDetailSheet({ item, onClose }: ChangeDetailSheetProps) {
  const { data: users = [] } = useUsers()
  return (
    <Sheet
      open={item !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        {item ? (
          <>
            <SheetHeader className="border-b border-border px-5 pt-5 pb-4">
              <SheetDescription className="text-[11px] font-semibold tracking-[0.08em] uppercase">
                Detalle del cambio
              </SheetDescription>
              <SheetTitle className="text-lg">{item.project.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">
                {item.project.code} · Versión {item.version.versionNumber} ·{' '}
                {formatDate(item.changedAt)}
              </p>
            </SheetHeader>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Campo</dt>
                  <dd className="pt-0.5 font-medium text-foreground">
                    {CHANGE_FIELD_LABELS[item.change.field]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Origen</dt>
                  <dd className="pt-0.5 font-medium text-foreground">
                    {SOURCE_LABELS[item.version.source]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Autor</dt>
                  <dd className="pt-0.5 font-medium text-foreground">
                    {item.actor?.name ?? 'Sistema'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Fecha</dt>
                  <dd className="pt-0.5 font-medium text-foreground">
                    {formatRelative(item.changedAt, DEMO_REFERENCE_DATE)}
                  </dd>
                </div>
              </dl>

              <div className="rounded-xl border border-border bg-sand-soft/50 p-4">
                <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                  Antes → después
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <ChangeValue
                    field={item.change.field}
                    value={item.change.oldValue}
                    users={users}
                    className="text-muted-foreground line-through"
                  />
                  <ArrowRight
                    aria-hidden="true"
                    className="size-4 text-muted-foreground"
                  />
                  <ChangeValue
                    field={item.change.field}
                    value={item.change.newValue}
                    users={users}
                    className="font-semibold text-foreground"
                  />
                </div>
              </div>

              {item.version.reason ? (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Motivo registrado
                  </p>
                  <p className="pt-1 text-sm text-foreground">
                    {item.version.reason}
                  </p>
                </div>
              ) : null}

              {item.alerts.length > 0 ? (
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
                    Reglas disparadas
                  </p>
                  <ul className="mt-2 space-y-2">
                    {item.alerts.map((alert) => {
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
                  Este cambio no disparó reglas de alerta.
                </p>
              )}

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button
                  size="sm"
                  render={
                    <Link to={`/projects/${item.project.id}?tab=historial`} />
                  }
                >
                  <History aria-hidden="true" className="size-4" />
                  Ver historial
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link to={`/projects/${item.project.id}?tab=comparar`} />
                  }
                >
                  <GitCompareArrows aria-hidden="true" className="size-4" />
                  Comparar versiones
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
