import { Router } from 'express'
import { idParamSchema } from '../../domain/schemas/common.js'
import { versionQuerySchema } from '../../domain/schemas/change.js'
import { NotFoundError } from '../../lib/errors.js'
import { parseOrThrow } from '../../lib/validate.js'
import { versionRepository } from '../../data/repositories/version-repository.js'

export const versionsRouter = Router()

versionsRouter.get('/', async (req, res) => {
  const query = parseOrThrow(versionQuerySchema, req.query)
  res.json(await versionRepository.list(query))
})

versionsRouter.get('/:id', async (req, res) => {
  const { id } = parseOrThrow(idParamSchema, req.params)
  const version = await versionRepository.getById(id)

  if (!version) {
    throw new NotFoundError('La versión solicitada no existe.')
  }

  res.json(version)
})
