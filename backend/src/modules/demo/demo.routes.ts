import { Router } from 'express'
import { seedDatabase } from '../../data/services/seed-database.js'

export const demoRouter = Router()

demoRouter.post('/reset', async (_req, res) => {
  const result = await seedDatabase()
  res.json({ status: 'ok', ...result })
})
