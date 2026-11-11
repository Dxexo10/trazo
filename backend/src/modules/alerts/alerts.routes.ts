import { Router } from 'express'
import { alertQuerySchema } from '../../domain/schemas/alert.js'
import { alertStatusUpdateSchema } from '../../domain/schemas/alert.js'
import { idParamSchema } from '../../domain/schemas/common.js'
import { NotFoundError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { alertRepository } from '../../data/repositories/alert-repository.js'

export const alertsRouter = Router()

alertsRouter.get('/count-open', async (_req, res) => {
  res.json({ count: await alertRepository.countOpen() })
})

alertsRouter.get('/', async (req, res) => {
  const query = parseOrThrow(alertQuerySchema, req.query)
  res.json(await alertRepository.list(query))
})

alertsRouter.get('/:id', async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params)
  const alert = await alertRepository.getById(id)

  if (!alert) {
    throw new NotFoundError('La alerta solicitada no existe.')
  }

  res.json(alert)
})

alertsRouter.patch('/:id/status', async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params)
  const input = parseOrThrow(alertStatusUpdateSchema, req.body)
  res.json(await alertRepository.updateStatus(id, input))
})
