import { Router } from 'express'
import { activityQuerySchema } from '../../domain/schemas/activity.js'
import { parseOrThrow } from '../../lib/validate.js'
import { activityRepository } from '../../data/repositories/activity-repository.js'

export const activityRouter = Router()

activityRouter.get('/', async (req, res) => {
  const query = parseOrThrow(activityQuerySchema, req.query)
  res.json(await activityRepository.list(query))
})
