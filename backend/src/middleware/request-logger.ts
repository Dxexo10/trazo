import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (env.isTest) {
    next()
    return
  }

  const startedAt = process.hrtime.bigint()

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000

    console.info(
      JSON.stringify({
        level: 'info',
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        durationMs: Math.round(durationMs * 10) / 10,
      }),
    )
  })

  next()
}
