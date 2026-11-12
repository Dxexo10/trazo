import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  DEMO_WRITES_ENABLED: z.enum(['true', 'false']).optional(),
  DATABASE_URL: z.string().min(1).optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')

  console.error(`[trazo-api] Configuración inválida:\n${details}`)
  process.exit(1)
}

const raw = parsed.data
const corsOrigins = raw.CORS_ORIGINS.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

/**
 * En producción las escrituras quedan desactivadas salvo que se habiliten
 * explícitamente, para que la demo pública sea de solo lectura por defecto.
 */
const demoWritesEnabled =
  raw.DEMO_WRITES_ENABLED === undefined
    ? raw.NODE_ENV !== 'production'
    : raw.DEMO_WRITES_ENABLED === 'true'

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
  port: raw.PORT,
  corsOrigins,
  demoWritesEnabled,
  databaseUrl: raw.DATABASE_URL,
} as const
