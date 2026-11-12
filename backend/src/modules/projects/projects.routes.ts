import { Router } from 'express'
import { z } from 'zod'
import { changeQuerySchema } from '../../domain/schemas/change.js'
import { createProjectSchema } from '../../domain/schemas/project.js'
import { projectQuerySchema } from '../../domain/schemas/project.js'
import { projectIdParamSchema } from '../../domain/schemas/project.js'
import { updateProjectSchema } from '../../domain/schemas/project.js'
import { DEMO_CURRENT_USER } from '../../domain/seed/users.js'
import { NotFoundError } from '../../lib/errors.js'
import { requireDemoWrites } from '../../middleware/demo-writes.js'
import { parseOrThrow } from '../../lib/validate.js'
import { changeRepository } from '../../data/repositories/change-repository.js'
import { projectRepository } from '../../data/repositories/project-repository.js'

const reasonQuerySchema = z.object({
  reason: z.string().trim().max(500).optional(),
})

export const projectsRouter = Router()

projectsRouter.get('/', async (req, res) => {
  const query = parseOrThrow(projectQuerySchema, req.query)
  res.json(await projectRepository.list(query))
})

projectsRouter.post('/', requireDemoWrites, async (req, res) => {
  const input = parseOrThrow(createProjectSchema, req.body)
  const project = await projectRepository.create(input)
  res.status(201).json(project)
})

projectsRouter.get('/:id', async (req, res) => {
  const { id } = parseOrThrow(projectIdParamSchema, req.params)
  const project = await projectRepository.getById(id)

  if (!project) {
    throw new NotFoundError('El proyecto solicitado no existe.')
  }

  res.json(project)
})

projectsRouter.patch('/:id', requireDemoWrites, async (req, res) => {
  const { id } = parseOrThrow(projectIdParamSchema, req.params)
  const input = parseOrThrow(updateProjectSchema, req.body)
  const { reason } = parseOrThrow(reasonQuerySchema, req.query)

  const result = await projectRepository.update(id, input, {
    actorId: DEMO_CURRENT_USER.id,
    source: 'manual',
    reason,
  })

  res.json(result)
})

projectsRouter.post('/:id/archive', requireDemoWrites, async (req, res) => {
  const { id } = parseOrThrow(projectIdParamSchema, req.params)
  await projectRepository.archive(id)
  res.status(204).end()
})

projectsRouter.get('/:id/versions', async (req, res) => {
  const { id } = parseOrThrow(projectIdParamSchema, req.params)
  res.json(await projectRepository.listVersions(id))
})

projectsRouter.get('/:id/changes', async (req, res) => {
  const { id } = parseOrThrow(projectIdParamSchema, req.params)
  const query = parseOrThrow(changeQuerySchema, req.query)

  const project = await projectRepository.getById(id)
  if (!project) {
    throw new NotFoundError('El proyecto solicitado no existe.')
  }

  res.json(await changeRepository.list({ ...query, projectId: id }))
})
