import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { API_PREFIX } from './config/app-info.js'
import { env } from './config/env.js'
import { errorHandler } from './middleware/error-handler.js'
import { notFound } from './middleware/not-found.js'
import { requestId } from './middleware/request-id.js'
import { requestLogger } from './middleware/request-logger.js'
import { apiRouter } from './routes/index.js'

export const app = express()

app.disable('x-powered-by')

app.use(helmet())
app.use(
  cors({
    origin: env.corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  }),
)
app.use(express.json({ limit: '1mb' }))
app.use(requestId)
app.use(requestLogger)

app.use(API_PREFIX, apiRouter)

app.use(notFound)
app.use(errorHandler)
