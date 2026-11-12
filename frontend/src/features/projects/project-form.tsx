import { useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PRIORITY_LABELS, SECTOR_LABELS, STATUS_LABELS } from '@/lib/labels'
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SECTORS,
  type User,
} from '@/domain/models'
import { percentageChange, formatPercentage } from '@/domain/utils/money'
import { cn } from '@/lib/utils'
import {
  projectFormSchema,
  type ProjectFormValues,
} from './project-form-schema'

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

interface ProjectFormProps {
  defaultValues: ProjectFormValues
  users: readonly User[]
  onSubmit: (values: ProjectFormValues) => void
  isSubmitting: boolean
  submitLabel: string
  cancelHref: string
}

export function ProjectForm({
  defaultValues,
  users,
  onSubmit,
  isSubmitting,
  submitLabel,
  cancelHref,
}: ProjectFormProps) {
  const navigate = useNavigate()
  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isDirty },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  })

  const status = useWatch({ control, name: 'status' })
  const initialBudget = Number(useWatch({ control, name: 'initialBudget' }))
  const currentBudget = Number(useWatch({ control, name: 'currentBudget' }))
  const variation =
    Number.isFinite(initialBudget) && Number.isFinite(currentBudget)
      ? percentageChange(initialBudget, currentBudget)
      : null

  useEffect(() => {
    if (!isDirty) return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  useEffect(() => {
    if (users.length === 0 || getValues('ownerId')) return

    const firstOwner = users[0]
    if (firstOwner) {
      setValue('ownerId', firstOwner.id, { shouldValidate: true })
    }
  }, [users, getValues, setValue])

  const ownerItems = Object.fromEntries(
    users.map((user) => [user.id, user.name]),
  )
  const sectorItems = Object.fromEntries(
    SECTORS.map((sector) => [sector, SECTOR_LABELS[sector]]),
  )
  const statusItems = Object.fromEntries(
    PROJECT_STATUSES.map((option) => [option, STATUS_LABELS[option]]),
  )
  const priorityItems = Object.fromEntries(
    PROJECT_PRIORITIES.map((option) => [option, PRIORITY_LABELS[option]]),
  )

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Card className="gap-5 p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Información general
          </h2>
          <p className="text-sm text-muted-foreground">
            Identidad del proyecto, cliente y responsables.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Nombre del proyecto"
            htmlFor="project-name"
            error={errors.name?.message}
            className="sm:col-span-2"
          >
            <Input
              id="project-name"
              className="h-9 bg-surface"
              placeholder="Implementación de ERP corporativo"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'project-name-error' : undefined}
              {...register('name')}
            />
          </Field>

          <Field
            label="Cliente"
            htmlFor="project-client"
            error={errors.client?.message}
          >
            <Input
              id="project-client"
              className="h-9 bg-surface"
              placeholder="Grupo Andino"
              aria-invalid={Boolean(errors.client)}
              aria-describedby={
                errors.client ? 'project-client-error' : undefined
              }
              {...register('client')}
            />
          </Field>

          <Field
            label="Sector"
            htmlFor="project-sector"
            error={errors.sector?.message}
          >
            <Controller
              control={control}
              name="sector"
              render={({ field }) => (
                <Select
                  items={sectorItems}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="project-sector"
                    className="h-9 w-full bg-surface"
                    aria-invalid={Boolean(errors.sector)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {SECTOR_LABELS[sector]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Responsable"
            htmlFor="project-owner"
            error={errors.ownerId?.message}
          >
            <Controller
              control={control}
              name="ownerId"
              render={({ field }) => (
                <Select
                  items={ownerItems}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="project-owner"
                    className="h-9 w-full bg-surface"
                    aria-invalid={Boolean(errors.ownerId)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Estado"
            htmlFor="project-status"
            error={errors.status?.message}
          >
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  items={statusItems}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="project-status"
                    className="h-9 w-full bg-surface"
                    aria-invalid={Boolean(errors.status)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_STATUSES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {STATUS_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Prioridad"
            htmlFor="project-priority"
            error={errors.priority?.message}
          >
            <Controller
              control={control}
              name="priority"
              render={({ field }) => (
                <Select
                  items={priorityItems}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="project-priority"
                    className="h-9 w-full bg-surface"
                    aria-invalid={Boolean(errors.priority)}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PROJECT_PRIORITIES.map((option) => (
                      <SelectItem key={option} value={option}>
                        {PRIORITY_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field
            label="Descripción"
            htmlFor="project-description"
            error={errors.description?.message}
            className="sm:col-span-2"
          >
            <Textarea
              id="project-description"
              className="min-h-24 bg-surface"
              placeholder="Alcance, objetivos y contexto del proyecto."
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? 'project-description-error' : undefined
              }
              {...register('description')}
            />
          </Field>

          <Field
            label="Etiquetas"
            htmlFor="project-tags"
            error={errors.tags?.message}
            hint="Sepáralas con comas. Máximo 6."
            className="sm:col-span-2"
          >
            <Input
              id="project-tags"
              className="h-9 bg-surface"
              placeholder="ERP, procesos, finanzas"
              aria-invalid={Boolean(errors.tags)}
              {...register('tags')}
            />
          </Field>
        </div>
      </Card>

      <Card className="gap-5 p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Presupuesto
          </h2>
          <p className="text-sm text-muted-foreground">
            La línea base es el presupuesto inicial; el vigente refleja los
            ajustes aprobados. Montos en soles (PEN).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Presupuesto inicial (S/)"
            htmlFor="project-initial-budget"
            error={errors.initialBudget?.message}
          >
            <Input
              id="project-initial-budget"
              type="number"
              min={0}
              step="0.01"
              className="h-9 bg-surface tabular-nums"
              aria-invalid={Boolean(errors.initialBudget)}
              {...register('initialBudget')}
            />
          </Field>

          <Field
            label="Presupuesto actual (S/)"
            htmlFor="project-current-budget"
            error={errors.currentBudget?.message}
          >
            <Input
              id="project-current-budget"
              type="number"
              min={0}
              step="0.01"
              className="h-9 bg-surface tabular-nums"
              aria-invalid={Boolean(errors.currentBudget)}
              {...register('currentBudget')}
            />
          </Field>
        </div>

        <div className="rounded-xl border border-border bg-sand-soft/60 px-3 py-2 text-xs text-muted-foreground">
          Variación actual:{' '}
          <span className="font-medium tabular-nums text-foreground">
            {formatPercentage(variation)}
          </span>{' '}
          respecto a la línea base.
        </div>
      </Card>

      <Card className="gap-5 p-5">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">
            Cronograma y avance
          </h2>
          <p className="text-sm text-muted-foreground">
            Fechas en formato ISO. El avance va de 0 a 100 %.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Fecha de inicio"
            htmlFor="project-start-date"
            error={errors.startDate?.message}
          >
            <Input
              id="project-start-date"
              type="date"
              className="h-9 bg-surface"
              aria-invalid={Boolean(errors.startDate)}
              {...register('startDate')}
            />
          </Field>

          <Field
            label="Fecha de entrega"
            htmlFor="project-due-date"
            error={errors.dueDate?.message}
          >
            <Input
              id="project-due-date"
              type="date"
              className="h-9 bg-surface"
              aria-invalid={Boolean(errors.dueDate)}
              {...register('dueDate')}
            />
          </Field>

          <Field
            label="Avance (%)"
            htmlFor="project-progress"
            error={errors.progress?.message}
          >
            <Input
              id="project-progress"
              type="number"
              min={0}
              max={100}
              step={1}
              className="h-9 bg-surface tabular-nums"
              aria-invalid={Boolean(errors.progress)}
              {...register('progress')}
            />
          </Field>

          {status === 'completed' ? (
            <Field
              label="Fecha de cierre real"
              htmlFor="project-completed-at"
              error={errors.completedAt?.message}
            >
              <Input
                id="project-completed-at"
                type="date"
                className="h-9 bg-surface"
                aria-invalid={Boolean(errors.completedAt)}
                {...register('completedAt')}
              />
            </Field>
          ) : null}
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={(event) => {
            if (
              isDirty &&
              !window.confirm(
                'Hay cambios sin guardar. ¿Quieres salir de todos modos?',
              )
            ) {
              event.preventDefault()
              return
            }
            navigate(cancelHref)
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save aria-hidden="true" className="size-4" />
          {isSubmitting ? 'Guardando…' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
