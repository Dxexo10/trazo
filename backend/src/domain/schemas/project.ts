import { z } from 'zod'
import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  SECTORS,
} from '../models/project.js'
import {
  booleanQuery,
  csvEnum,
  dateOnlySchema,
  isoDateTimeSchema,
  MAX_BUDGET_CENTS,
  paginationQuerySchema,
  uuidSchema,
} from './common.js'

export const PROJECT_SORT_FIELDS = [
  'name',
  'updatedAt',
  'dueDate',
  'budget',
] as const

const moneyCentsSchema = z
  .number()
  .int('Debe ser un entero de céntimos.')
  .min(0, 'No puede ser negativo.')
  .max(MAX_BUDGET_CENTS, 'Excede el máximo permitido.')

const tagsSchema = z
  .array(
    z.string().trim().min(1).max(24, 'Cada etiqueta admite 24 caracteres.'),
  )
  .max(6, 'Usa como máximo 6 etiquetas.')

const projectFieldShape = {
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres.')
    .max(90, 'El nombre no puede superar 90 caracteres.'),
  description: z
    .string()
    .trim()
    .min(10, 'La descripción debe tener al menos 10 caracteres.')
    .max(600, 'La descripción no puede superar 600 caracteres.'),
  sector: z.enum(SECTORS),
  client: z
    .string()
    .trim()
    .min(2, 'Indica el cliente.')
    .max(80, 'El cliente no puede superar 80 caracteres.'),
  ownerId: uuidSchema,
  status: z.enum(PROJECT_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
  initialBudgetCents: moneyCentsSchema,
  currentBudgetCents: moneyCentsSchema,
  currency: z.literal('PEN'),
  progress: z
    .number()
    .int('El avance debe ser un entero.')
    .min(0, 'El avance no puede ser negativo.')
    .max(100, 'El avance no puede superar 100.'),
  startDate: dateOnlySchema,
  dueDate: dateOnlySchema,
  completedAt: dateOnlySchema.nullable(),
  tags: tagsSchema,
}

export const createProjectSchema = z
  .object({
    ...projectFieldShape,
    currency: z.literal('PEN').default('PEN'),
    completedAt: dateOnlySchema.nullable().default(null),
    tags: tagsSchema.default([]),
  })
  .strict()
  .superRefine((values, ctx) => {
    if (values.dueDate < values.startDate) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDate'],
        message: 'La entrega no puede ser anterior al inicio.',
      })
    }

    if (values.status === 'completed') {
      if (values.progress !== 100) {
        ctx.addIssue({
          code: 'custom',
          path: ['progress'],
          message: 'Un proyecto completado debe tener 100 % de avance.',
        })
      }

      if (!values.completedAt) {
        ctx.addIssue({
          code: 'custom',
          path: ['completedAt'],
          message: 'Indica la fecha de cierre real.',
        })
      }
    } else if (values.completedAt) {
      ctx.addIssue({
        code: 'custom',
        path: ['completedAt'],
        message: 'Solo un proyecto completado puede tener fecha de cierre.',
      })
    }
  })

export const updateProjectSchema = z
  .object(projectFieldShape)
  .partial()
  .strict()
  .superRefine((values, ctx) => {
    if (
      values.startDate &&
      values.dueDate &&
      values.dueDate < values.startDate
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['dueDate'],
        message: 'La entrega no puede ser anterior al inicio.',
      })
    }

    if (
      values.status === 'completed' &&
      values.progress !== undefined &&
      values.progress !== 100
    ) {
      ctx.addIssue({
        code: 'custom',
        path: ['progress'],
        message: 'Un proyecto completado debe tener 100 % de avance.',
      })
    }
  })

export const projectQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().max(120).optional(),
  status: csvEnum(PROJECT_STATUSES),
  priority: csvEnum(PROJECT_PRIORITIES),
  sector: csvEnum(SECTORS),
  ownerId: uuidSchema.optional(),
  createdAfter: isoDateTimeSchema.optional(),
  includeArchived: booleanQuery(false),
  onlyArchived: booleanQuery(false),
  sortBy: z.enum(PROJECT_SORT_FIELDS).default('updatedAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
})

export const projectIdParamSchema = z.object({
  id: uuidSchema,
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectQuery = z.infer<typeof projectQuerySchema>
