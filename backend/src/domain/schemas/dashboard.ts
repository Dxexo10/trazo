import { z } from 'zod'

export const dashboardQuerySchema = z.object({
  periodMonths: z
    .preprocess(
      (value) => (value === undefined ? '12' : String(value)),
      z.enum(['3', '6', '12']),
    )
    .transform((value) => Number(value) as 3 | 6 | 12),
})

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>
