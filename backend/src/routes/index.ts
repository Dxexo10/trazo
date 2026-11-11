import { Router } from 'express'
import { activityRouter } from '../modules/activity/activity.routes.js'
import { alertsRouter } from '../modules/alerts/alerts.routes.js'
import { changesRouter } from '../modules/changes/changes.routes.js'
import { dashboardRouter } from '../modules/dashboard/dashboard.routes.js'
import { demoRouter } from '../modules/demo/demo.routes.js'
import { projectsRouter } from '../modules/projects/projects.routes.js'
import { rulesRouter } from '../modules/rules/rules.routes.js'
import { usersRouter } from '../modules/users/users.routes.js'
import { versionsRouter } from '../modules/versions/versions.routes.js'
import { healthRouter } from './health.js'

export const apiRouter = Router()

apiRouter.use('/health', healthRouter)
apiRouter.use('/dashboard', dashboardRouter)
apiRouter.use('/projects', projectsRouter)
apiRouter.use('/alerts', alertsRouter)
apiRouter.use('/activity', activityRouter)
apiRouter.use('/versions', versionsRouter)
apiRouter.use('/changes', changesRouter)
apiRouter.use('/rules', rulesRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/demo', demoRouter)
