import { z } from 'zod'
import { ALERT_SEVERITIES } from '../models/alert.js'

export const ruleUpdateSchema = z
  .object({
    enabled: z.boolean().optional(),
    threshold: z.number().int().min(0).max(10_000).nullable().optional(),
    severity: z.enum(ALERT_SEVERITIES).optional(),
  })
  .strict()
  .refine((values) => Object.keys(values).length > 0, {
    message: 'Indica al menos un cambio.',
  })

export type RuleUpdateInput = z.infer<typeof ruleUpdateSchema>
