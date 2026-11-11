import { z } from 'zod'
import { ALERT_SEVERITIES, ALERT_STATUSES } from '../models/alert.js'
import {
  csvEnum,
  isoDateTimeSchema,
  paginationQuerySchema,
  uuidSchema,
} from './common.js'

export const alertQuerySchema = paginationQuerySchema.extend({
  status: csvEnum(ALERT_STATUSES),
  severity: csvEnum(ALERT_SEVERITIES),
  projectId: uuidSchema.optional(),
  createdAfter: isoDateTimeSchema.optional(),
})

export const alertStatusUpdateSchema = z
  .object({
    status: z.enum(ALERT_STATUSES),
  })
  .strict()

export type AlertQuery = z.infer<typeof alertQuerySchema>
export type AlertStatusUpdate = z.infer<typeof alertStatusUpdateSchema>
