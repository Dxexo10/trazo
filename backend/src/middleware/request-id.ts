import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

const MAX_REQUEST_ID_LENGTH = 128

export function requestId(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const incoming = req.header('x-request-id')?.trim()
  req.requestId =
    incoming && incoming.length <= MAX_REQUEST_ID_LENGTH
      ? incoming
      : randomUUID()

  res.setHeader('x-request-id', req.requestId)
  next()
}
