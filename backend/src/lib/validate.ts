import type { ZodType } from 'zod'
import { AppError } from './errors.js'

export function parseOrThrow<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)

  if (!result.success) {
    throw new AppError(
      400,
      'validation_error',
      'La petición no es válida.',
      result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    )
  }

  return result.data
}
