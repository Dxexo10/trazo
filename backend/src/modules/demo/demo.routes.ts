import { Router } from 'express'
import { projectRepository } from '../../data/repositories/project-repository.js'
import { seedDatabase } from '../../data/services/seed-database.js'
import {
  runScenarioSchema,
  scenarioIdParamSchema,
} from '../../domain/schemas/demo.js'
import { SCENARIOS } from '../../domain/scenarios.js'
import { DEMO_CURRENT_USER } from '../../domain/seed/users.js'
import { NotFoundError } from '../../lib/errors.js'
import { requireDemoWrites } from '../../middleware/demo-writes.js'
import { parseOrThrow } from '../../lib/validate.js'

export const demoRouter = Router()

demoRouter.post('/reset', requireDemoWrites, async (_req, res) => {
  const result = await seedDatabase()
  res.json({ status: 'ok', ...result })
})

demoRouter.post('/scenarios/:id/run', requireDemoWrites, async (req, res) => {
  const { id } = parseOrThrow(scenarioIdParamSchema, req.params)
  const { projectId } = parseOrThrow(runScenarioSchema, req.body)

  const project = await projectRepository.getById(projectId)

  if (!project) {
    throw new NotFoundError('El proyecto solicitado no existe.')
  }

  const scenario = SCENARIOS[id]

  const result = await projectRepository.update(
    projectId,
    scenario.buildInput(project),
    {
      actorId: DEMO_CURRENT_USER.id,
      source: 'simulated',
      reason: scenario.reason,
    },
  )

  res.json(result)
})
