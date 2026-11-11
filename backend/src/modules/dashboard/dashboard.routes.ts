import { Router } from 'express'
import { dashboardQuerySchema } from '../../domain/schemas/dashboard.js'
import { buildDashboardSummary } from '../../domain/services/dashboard-summary.js'
import { DEMO_REFERENCE_DATE } from '../../lib/demo-config.js'
import { parseOrThrow } from '../../lib/validate.js'
import { alertRepository } from '../../data/repositories/alert-repository.js'
import { projectRepository } from '../../data/repositories/project-repository.js'

export const dashboardRouter = Router()

dashboardRouter.get('/summary', async (req, res) => {
  const { periodMonths } = parseOrThrow(dashboardQuerySchema, req.query)

  const [projects, alerts] = await Promise.all([
    projectRepository.getAll(),
    alertRepository.getAll(),
  ])

  res.json(
    buildDashboardSummary({
      projects,
      alerts,
      filters: { periodMonths },
      referenceDate: DEMO_REFERENCE_DATE,
    }),
  )
})
