import { describe, expect, it } from 'vitest'
import { activityQuerySchema } from './activity.js'
import { alertQuerySchema, alertStatusUpdateSchema } from './alert.js'

const projectId = '0b5f0a3e-6b1c-4c34-9e0f-2d3a4b5c6d7e'

describe('alertQuerySchema', () => {
  it('interpreta severidades y estados separados por coma', () => {
    const result = alertQuerySchema.parse({
      status: 'open,reviewed',
      severity: 'critical',
      projectId,
    })

    expect(result.status).toEqual(['open', 'reviewed'])
    expect(result.severity).toEqual(['critical'])
    expect(result.projectId).toBe(projectId)
  })

  it('rechaza un estado desconocido', () => {
    expect(alertQuerySchema.safeParse({ status: 'archived' }).success).toBe(
      false,
    )
  })
})

describe('alertStatusUpdateSchema', () => {
  it('acepta un cambio de estado válido', () => {
    expect(alertStatusUpdateSchema.parse({ status: 'resolved' })).toEqual({
      status: 'resolved',
    })
  })

  it('rechaza campos adicionales', () => {
    expect(
      alertStatusUpdateSchema.safeParse({
        status: 'resolved',
        resolvedAt: '2026-01-01T00:00:00.000Z',
      }).success,
    ).toBe(false)
  })
})

describe('activityQuerySchema', () => {
  it('valida fuentes y fechas ISO con desplazamiento', () => {
    const result = activityQuerySchema.parse({
      source: 'manual,system',
      createdAfter: '2026-01-01T00:00:00.000Z',
    })

    expect(result.source).toEqual(['manual', 'system'])
  })

  it('rechaza una fecha de corte inválida', () => {
    expect(
      activityQuerySchema.safeParse({ createdAfter: '2026-01-01' }).success,
    ).toBe(false)
  })
})
