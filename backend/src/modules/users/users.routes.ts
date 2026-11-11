import { Router } from 'express'
import { userRepository } from '../../data/repositories/user-repository.js'

export const usersRouter = Router()

usersRouter.get('/', async (_req, res) => {
  res.json(await userRepository.list())
})
