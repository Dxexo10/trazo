import type { NextFunction, Request, Response } from 'express'
import { env } from '../config/env.js'
import { AppError } from '../lib/errors.js'

const READ_ONLY_MESSAGE = 'El entorno de demostración es de solo lectura.'

export function createDemoWriteGuard(isEnabled: () => boolean) {
  return function demoWriteGuard(
    _req: Request,
    _res: Response,
    next: NextFunction,
  ): void {
    if (!isEnabled()) {
      next(new AppError(403, 'demo_read_only', READ_ONLY_MESSAGE))
      return
    }

    next()
  }
}

export const requireDemoWrites = createDemoWriteGuard(
  () => env.demoWritesEnabled,
)
