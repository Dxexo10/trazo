import { Link } from 'react-router-dom'
import { Eye, PencilLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PriorityBadge } from '@/components/shared/priority-badge'
import { ProgressBar } from '@/components/shared/progress-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { UserChip } from '@/components/shared/user-chip'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Project, User } from '@/domain/models'
import { formatDate } from '@/domain/utils/date'
import { formatCurrency } from '@/domain/utils/money'
import { isOverdue } from '@/domain/services/project-metrics'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { cn } from '@/lib/utils'
import { ArchiveProjectButton } from './archive-project-button'

interface ProjectsTableProps {
  projects: Project[]
  users: readonly User[]
}

export function ProjectsTable({ projects, users }: ProjectsTableProps) {
  const usersById = new Map(users.map((user) => [user.id, user]))

  return (
    <Table label="Proyectos">
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="pl-5">Proyecto</TableHead>
          <TableHead>Responsable</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Prioridad</TableHead>
          <TableHead className="w-[150px]">Avance</TableHead>
          <TableHead>Presupuesto</TableHead>
          <TableHead>Entrega</TableHead>
          <TableHead className="pr-5 text-right">
            <span className="sr-only">Acciones</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => {
          const owner = usersById.get(project.ownerId)
          const overdue = isOverdue(project, DEMO_REFERENCE_DATE)

          return (
            <TableRow key={project.id}>
              <TableCell className="max-w-[300px] pl-5 whitespace-normal">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="block truncate font-medium text-foreground transition-colors hover:text-brand-terracotta-hover hover:underline"
                  >
                    {project.name}
                  </Link>
                  {project.archivedAt ? (
                    <span className="shrink-0 rounded-full border border-border bg-sand-soft px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Archivado
                    </span>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {project.code} · {project.client}
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
                <StatusBadge status={project.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={project.priority} />
              </TableCell>
              <TableCell>
                <ProgressBar
                  value={project.progress}
                  showLabel
                  label={`Avance de ${project.name}`}
                />
              </TableCell>
              <TableCell className="tabular-nums text-foreground">
                {formatCurrency(project.currentBudgetCents)}
              </TableCell>
              <TableCell
                className={cn(
                  'tabular-nums',
                  overdue ? 'font-medium text-danger' : 'text-muted-foreground',
                )}
              >
                {formatDate(project.dueDate)}
              </TableCell>
              <TableCell className="pr-5">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link to={`/projects/${project.id}`} />}
                    aria-label={`Ver ${project.name}`}
                  >
                    <Eye aria-hidden="true" className="size-3.5" />
                    Ver
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={<Link to={`/projects/${project.id}/edit`} />}
                    aria-label={`Editar ${project.name}`}
                  >
                    <PencilLine aria-hidden="true" className="size-3.5" />
                    Editar
                  </Button>
                  {project.archivedAt ? null : (
                    <ArchiveProjectButton project={project} />
                  )}
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
