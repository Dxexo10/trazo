import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, FolderSearch } from 'lucide-react'
import { DemoBadge } from '@/components/shared/demo-badge'
import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useUsers } from '@/features/users/hooks/use-users'
import { useUpdateProject } from './hooks/use-project-mutations'
import { useProjectQuery } from './hooks/use-project-query'
import { ProjectForm } from './project-form'
import {
  toFormValues,
  toProjectInput,
  type ProjectFormValues,
} from './project-form-schema'

export function ProjectEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const projectQuery = useProjectQuery(id)
  const update = useUpdateProject(id ?? '')
  const [reason, setReason] = useState('')
  const { data: users = [] } = useUsers()

  if (projectQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-80" />
        <Card className="gap-3 p-5">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full rounded-xl" />
          ))}
        </Card>
      </div>
    )
  }

  if (projectQuery.isError) {
    return (
      <ErrorState
        message={
          projectQuery.error instanceof Error
            ? projectQuery.error.message
            : 'No pudimos cargar el proyecto.'
        }
        onRetry={() => void projectQuery.refetch()}
      />
    )
  }

  const project = projectQuery.data

  if (!project) {
    return (
      <EmptyState
        icon={FolderSearch}
        title="Proyecto no encontrado"
        description="Puede que ya no exista o que el enlace sea incorrecto."
        action={
          <Button variant="outline" size="sm" render={<Link to="/projects" />}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al listado
          </Button>
        }
      />
    )
  }

  const values: ProjectFormValues = toFormValues(project)

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Editar proyecto"
        description={`${project.code} · ${project.name}`}
        meta={<DemoBadge />}
        actions={
          <Button
            variant="outline"
            size="sm"
            render={<Link to={`/projects/${project.id}`} />}
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al detalle
          </Button>
        }
      />

      <Card className="gap-3 p-4 sm:p-5">
        <div className="space-y-1.5">
          <Label
            htmlFor="change-reason"
            className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground uppercase"
          >
            Motivo del cambio (opcional)
          </Label>
          <Input
            id="change-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={200}
            placeholder="Ej. Ajuste de presupuesto aprobado por el cliente"
          />
          <p className="text-xs text-muted-foreground">
            Se guardará en la nueva versión y en el historial del proyecto.
          </p>
        </div>
      </Card>

      <ProjectForm
        key={project.id}
        defaultValues={values}
        users={users}
        isSubmitting={update.isPending}
        submitLabel="Guardar cambios"
        cancelHref={`/projects/${project.id}`}
        onSubmit={(nextValues) => {
          update.mutate(
            { input: toProjectInput(nextValues), reason },
            {
              onSuccess: () => navigate(`/projects/${project.id}`),
            },
          )
        }}
      />
    </div>
  )
}
