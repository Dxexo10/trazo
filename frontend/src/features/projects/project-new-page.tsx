import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { DemoBadge } from '@/components/shared/demo-badge'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { addDays, parseDate, toISODate } from '@/domain/utils/date'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { useUsers } from '@/features/users/hooks/use-users'
import { useCreateProject } from './hooks/use-project-mutations'
import { ProjectForm } from './project-form'
import {
  toProjectInput,
  type ProjectFormValues,
} from './project-form-schema'

const DEFAULT_DATES: ProjectFormValues = {
  name: '',
  client: '',
  description: '',
  sector: 'technology',
  ownerId: '',
  status: 'planned',
  priority: 'medium',
  initialBudget: '0',
  currentBudget: '0',
  progress: '0',
  startDate: DEMO_REFERENCE_DATE,
  dueDate: toISODate(addDays(parseDate(DEMO_REFERENCE_DATE), 30)),
  completedAt: '',
  tags: '',
}

export function ProjectNewPage() {
  const navigate = useNavigate()
  const create = useCreateProject()
  const { data: users = [] } = useUsers()
  const defaultValues: ProjectFormValues = {
    ...DEFAULT_DATES,
    ownerId: users[0]?.id ?? '',
  }

  return (
    <div className="space-y-5 lg:space-y-6">
      <PageHeader
        title="Nuevo proyecto"
        description="Registra el proyecto con su línea base, cronograma y responsable."
        meta={<DemoBadge />}
        actions={
          <Button variant="outline" size="sm" render={<Link to="/projects" />}>
            <ArrowLeft aria-hidden="true" className="size-4" />
            Volver al listado
          </Button>
        }
      />

      <ProjectForm
        defaultValues={defaultValues}
        users={users}
        isSubmitting={create.isPending}
        submitLabel="Crear proyecto"
        cancelHref="/projects"
        onSubmit={(values) => {
          create.mutate(toProjectInput(values), {
            onSuccess: (project) => navigate(`/projects/${project.id}`),
          })
        }}
      />
    </div>
  )
}
