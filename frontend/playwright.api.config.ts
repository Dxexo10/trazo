import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.E2E_APP_PORT ?? 5173)
const BASE_URL = `http://localhost:${PORT}`
const API_BASE_URL =
  process.env.E2E_API_BASE_URL ?? 'http://localhost:4000/api/v1'

/**
 * Suite de integración: la app consume la API real (SQL Server) en lugar de
 * IndexedDB. Requiere el backend arrancado con DEMO_WRITES_ENABLED=true y su
 * CORS_ORIGINS incluyendo este puerto (5173 por defecto). Escribe datos, así que
 * no se ejecuta en CI; se lanza con `npm run test:e2e:api`.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'api-integration.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
    env: { VITE_API_BASE_URL: API_BASE_URL },
  },
})
