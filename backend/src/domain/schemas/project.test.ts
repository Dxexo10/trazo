import { describe, expect, it } from 'vitest'
import {
  createProjectSchema,
  projectQuerySchema,
  updateProjectSchema,
} from './project.js'

const ownerId = '8f14e45f-ea3f-4f1b-9c2a-2b7a1a9f0c11'

const validProject = {
  name: 'Implementación de ERP corporativo',
  description: 'Despliegue del ERP en todas las sedes del cliente.',
  sector: 'technology',
  client: 'Grupo Andino',
  ownerId,
  status: 'in_progress',
  priority: 'high',
  initialBudgetCents: 420_000_000,
  currentBudgetCents: 504_000_000,
  progress: 45,
  startDate: '2026-01-15',
  dueDate: '2026-08-30',
  tags: ['erp', 'finanzas'],
} as const

describe('createProjectSchema', () => {
  it('acepta un proyecto válido y aplica los valores por defecto', () => {
    const result = createProjectSchema.parse(validProject)

    expect(result.currency).toBe('PEN')
    expect(result.completedAt).toBeNull()
    expect(result.tags).toEqual(['erp', 'finanzas'])
  })

  it('recorta espacios en los textos', () => {
    const result = createProjectSchema.parse({
      ...validProject,
      name: '  Proyecto con espacios  ',
    })

    expect(result.name).toBe('Proyecto con espacios')
  })

  it('rechaza una entrega anterior al inicio', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      startDate: '2026-09-01',
      dueDate: '2026-08-01',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['dueDate'])
  })

  it('exige 100 % de avance y fecha de cierre si está completado', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      status: 'completed',
      progress: 80,
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues.map((issue) => issue.path.join('.'))).toEqual([
      'progress',
      'completedAt',
    ])
  })

  it('rechaza propiedades desconocidas', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      id: 'inyectado',
    })

    expect(result.success).toBe(false)
  })

  it('rechaza fechas que no existen en el calendario', () => {
    const result = createProjectSchema.safeParse({
      ...validProject,
      startDate: '2026-02-30',
    })

    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['startDate'])
  })
})

describe('updateProjectSchema', () => {
  it('acepta una actualización parcial sin rellenar valores por defecto', () => {
    const result = updateProjectSchema.parse({
      currentBudgetCents: 500_000_000,
    })

    expect(result).toEqual({ currentBudgetCents: 500_000_000 })
  })

  it('rechaza propiedades desconocidas', () => {
    const result = updateProjectSchema.safeParse({ code: 'PRJ-999' })

    expect(result.success).toBe(false)
  })
})

describe('projectQuerySchema', () => {
  it('interpreta filtros separados por coma y valores por defecto', () => {
    const result = projectQuerySchema.parse({
      status: 'planned,in_progress',
      includeArchived: 'true',
      page: '2',
    })

    expect(result.status).toEqual(['planned', 'in_progress'])
    expect(result.includeArchived).toBe(true)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(20)
    expect(result.sortBy).toBe('updatedAt')
    expect(result.sortDirection).toBe('desc')
  })

  it('acepta filtros repetidos en la query', () => {
    const result = projectQuerySchema.parse({
      status: ['planned', 'completed'],
    })

    expect(result.status).toEqual(['planned', 'completed'])
  })

  it('rechaza un tamaño de página fuera del límite', () => {
    const result = projectQuerySchema.safeParse({ pageSize: '500' })

    expect(result.success).toBe(false)
  })

  it('rechaza un responsable que no es UUID', () => {
    const result = projectQuerySchema.safeParse({ ownerId: 'demo' })

    expect(result.success).toBe(false)
  })
})
