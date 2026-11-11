import { z } from 'zod'
import { ACTIVITY_SOURCES } from '../models/activity-log.js'
import {
  csvEnum,
  isoDateTimeSchema,
  paginationQuerySchema,
  uuidSchema,
} from './common.js'

export const activityQuerySchema = paginationQuerySchema.extend({
  projectId: uuidSchema.optional(),
  actorId: uuidSchema.optional(),
  action: z.string().trim().max(60).optional(),
  source: csvEnum(ACTIVITY_SOURCES),
  createdAfter: isoDateTimeSchema.optional(),
})

export type ActivityQuery = z.infer<typeof activityQuerySchema>
