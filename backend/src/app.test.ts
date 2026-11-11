import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { app } from './app.js'

describe('esqueleto de la API', () => {
  it('responde salud en /api/v1/health', async () => {
    const response = await request(app).get('/api/v1/health')

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      status: 'ok',
      service: 'trazo-api',
    })
    expect(response.headers['x-request-id']).toBeTruthy()
    expect(response.headers['x-powered-by']).toBeUndefined()
  })

  it('respeta el x-request-id enviado por el cliente', async () => {
    const requestId = 'prueba-123'
    const response = await request(app)
      .get('/api/v1/health')
      .set('x-request-id', requestId)

    expect(response.headers['x-request-id']).toBe(requestId)
  })

  it('devuelve 404 en JSON para rutas desconocidas', async () => {
    const response = await request(app).get('/api/v1/inexistente')

    expect(response.status).toBe(404)
    expect(response.body.error).toMatchObject({
      code: 'not_found',
    })
    expect(response.body.error.requestId).toBe(response.headers['x-request-id'])
  })

  it('devuelve 400 cuando el cuerpo no es JSON válido', async () => {
    const response = await request(app)
      .post('/api/v1/health')
      .set('Content-Type', 'application/json')
      .send('{"roto"')

    expect(response.status).toBe(400)
    expect(response.body.error).toMatchObject({
      code: 'invalid_json',
    })
  })
})
