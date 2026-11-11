import { z } from 'zod'

export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const MAX_BUDGET_CENTS = 100_000_000_000

export const uuidSchema = z.uuid('Debe ser un UUID válido.')

export const dateOnlySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato YYYY-MM-DD.')
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`)
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
  }, 'La fecha no existe en el calendario.')

export const isoDateTimeSchema = z.iso.datetime({ offset: true })

export function csvArray(value: unknown): string[] | undefined {
  if (value === undefined) return undefined

  const values = Array.isArray(value) ? value : [value]

  return values
    .flatMap((entry) => (typeof entry === 'string' ? entry.split(',') : []))
    .map((entry) => entry.trim())
    .filter(Boolean)
}

export function csvEnum<const T extends readonly [string, ...string[]]>(
  values: T,
) {
  return z.preprocess(csvArray, z.array(z.enum(values)).optional())
}

export function booleanQuery(defaultValue?: boolean) {
  const schema = z.preprocess((value) => {
    if (value === undefined) return undefined
    if (typeof value === 'boolean') return value
    if (value === 'true' || value === '1') return true
    if (value === 'false' || value === '0') return false
    return value
  }, z.boolean().optional())

  return defaultValue === undefined ? schema : schema.default(defaultValue)
}

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(DEFAULT_PAGE_SIZE),
})

export type PageQuery = z.infer<typeof paginationQuerySchema>
