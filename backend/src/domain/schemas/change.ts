import { z } from 'zod'
import { CHANGE_TYPES } from '../models/change-event.js'
import { paginationQuerySchema, uuidSchema } from './common.js'

export const changeQuerySchema = paginationQuerySchema.extend({
  projectId: uuidSchema.optional(),
  versionId: uuidSchema.optional(),
  field: z.enum(CHANGE_TYPES).optional(),
})

export type ChangeQuery = z.infer<typeof changeQuerySchema>

export const versionQuerySchema = paginationQuerySchema.extend({
  projectId: uuidSchema.optional(),
  from: z.iso.datetime({ offset: true }).optional(),
  to: z.iso.datetime({ offset: true }).optional(),
})

export type VersionQuery = z.infer<typeof versionQuerySchema>
