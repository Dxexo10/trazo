import { ArrowRight, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/shared/empty-state'
import { ProgressBar } from '@/components/shared/progress-bar'
import { SectionCard } from '@/components/shared/section-card'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserChip } from '@/components/shared/user-chip'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { User } from '@/domain/models'
import type { AttentionItem } from '@/domain/services/dashboard-summary'
import { formatDate } from '@/domain/utils/date'
import { cn } from '@/lib/utils'

const RISK_STYLES = {
  high: 'border-danger/20 bg-danger-soft text-danger',
  medium: 'border-warning/20 bg-warning-soft text-warning',
  low: 'border-border bg-sand-soft text-muted-foreground',
} as const

const RISK_LABELS = {
  high: 'Alto',
  medium: 'Medio',
  low: 'Bajo',
} as const

interface AttentionTableProps {
  items: AttentionItem[]
  users: User[]
}

export function AttentionTable({ items, users }: AttentionTableProps) {
  const usersById = new Map(users.map((user) => [user.id, user]))

  return (
    <SectionCard
      title="Proyectos que requieren atención"
      description="Priorizados por riesgo de cronograma, presupuesto y estado."
      action={
        <Button variant="ghost" size="sm" render={<Link to="/projects" />}>
          Ver todos
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Button>
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sin proyectos en riesgo"
          description="Aún no hay proyectos que coincidan con tus filtros."
        />
      ) : (
        <Table label="Proyectos que requieren atención">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5">Proyecto</TableHead>
              <TableHead>Responsable</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[140px]">Avance</TableHead>
              <TableHead>Entrega</TableHead>
              <TableHead>Riesgo</TableHead>
              <TableHead className="pr-5 text-right">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const owner = usersById.get(item.project.ownerId)

              return (
                <TableRow key={item.project.id}>
                  <TableCell className="max-w-[240px] pl-5 whitespace-normal">
                    <Link
                      to={`/projects/${item.project.id}`}
                      className="block truncate font-medium text-foreground hover:text-brand-terracotta-hover hover:underline"
                    >
                      {item.project.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {item.project.code} · {item.project.client}
                    </span>
                  </TableCell>
                  <TableCell>
                    {owner ? (
                      <UserChip name={owner.name} />
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Sin asignar
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={item.project.status} />
                  </TableCell>
                  <TableCell>
                    <ProgressBar
                      value={item.project.progress}
                      showLabel
                      label={`Avance de ${item.project.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-sm tabular-nums text-muted-foreground">
                    {formatDate(item.project.dueDate)}
                  </TableCell>
                  <TableCell>
                    <span
                      title={item.reasons.join(' · ')}
                      className={cn(
                        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                        RISK_STYLES[item.level],
                      )}
                    >
                      {RISK_LABELS[item.level]}
                    </span>
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      render={<Link to={`/projects/${item.project.id}`} />}
                      aria-label={`Ver ${item.project.name}`}
                    >
                      Ver
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </SectionCard>
  )
}
