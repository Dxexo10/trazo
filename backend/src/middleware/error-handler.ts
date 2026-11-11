import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { AppError } from '../lib/errors.js'

interface ErrorBody {
  code: string
  message: string
  details?: unknown
  requestId: string
}

interface NormalizedError {
  statusCode: number
  code: string
  message: string
  details?: unknown
}

function normalizeError(error: unknown): NormalizedError {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      message: error.message,
      details: error.details,
    }
  }

  if (error instanceof SyntaxError && 'body' in error) {
    return {
      statusCode: 400,
      code: 'invalid_json',
      message: 'El cuerpo de la petición no es JSON válido',
    }
  }

  return {
    statusCode: 500,
    code: 'internal_error',
    message: 'Error interno del servidor',
  }
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response<{ error: ErrorBody }>,
  _next: NextFunction,
): void {
  const normalized = normalizeError(error)

  if (normalized.statusCode >= 500) {
    console.error(
      JSON.stringify({
        level: 'error',
        requestId: req.requestId,
        method: req.method,
        path: req.originalUrl,
        message: error instanceof Error ? error.message : String(error),
      }),
    )
  }

  const body: ErrorBody = {
    code: normalized.code,
    message: normalized.message,
    requestId: req.requestId,
  }

  if (normalized.details !== undefined && !env.isProduction) {
    body.details = normalized.details
  }

  res.status(normalized.statusCode).json({ error: body })
}
