import { z } from 'zod'
import { SIMULATION_SCENARIOS } from '../scenarios.js'
import { uuidSchema } from './common.js'

export const scenarioIdParamSchema = z.object({
  id: z.enum(SIMULATION_SCENARIOS),
})

export const runScenarioSchema = z
  .object({
    projectId: uuidSchema,
  })
  .strict()

export type RunScenarioInput = z.infer<typeof runScenarioSchema>
