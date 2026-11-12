import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { errorHandler } from '../middleware/error-handler.js'
import { createDemoWriteGuard } from '../middleware/demo-writes.js'

function buildApp(enabled: boolean) {
  const app = express()
  app.post(
    '/write',
    createDemoWriteGuard(() => enabled),
    (_req, res) => {
      res.json({ ok: true })
    },
  )
  app.use(errorHandler)
  return app
}

describe('demo write guard', () => {
  it('permite escrituras cuando están habilitadas', async () => {
    const response = await request(buildApp(true)).post('/write')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({ ok: true })
  })

  it('bloquea escrituras con 403 cuando el entorno es de solo lectura', async () => {
    const response = await request(buildApp(false)).post('/write')

    expect(response.status).toBe(403)
    expect(response.body.error).toMatchObject({
      code: 'demo_read_only',
      message: 'El entorno de demostración es de solo lectura.',
    })
  })
})
