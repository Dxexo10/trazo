import { Router } from 'express'
import { changeQuerySchema } from '../../domain/schemas/change.js'
import { parseOrThrow } from '../../lib/validate.js'
import { changeRepository } from '../../data/repositories/change-repository.js'

export const changesRouter = Router()

changesRouter.get('/', async (req, res) => {
  const query = parseOrThrow(changeQuerySchema, req.query)
  res.json(await changeRepository.list(query))
})
