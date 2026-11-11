import { Router } from 'express'
import { idParamSchema } from '../../domain/schemas/common.js'
import { ruleUpdateSchema } from '../../domain/schemas/rule.js'
import { parseOrThrow } from '../../lib/validate.js'
import { ruleConfigRepository } from '../../data/repositories/rule-config-repository.js'

export const rulesRouter = Router()

rulesRouter.get('/', async (_req, res) => {
  res.json(await ruleConfigRepository.list())
})

rulesRouter.patch('/:id', async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params)
  const patch = parseOrThrow(ruleUpdateSchema, req.body)
  res.json(await ruleConfigRepository.update(id, patch))
})
