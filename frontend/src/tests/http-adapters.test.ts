import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { CreateProjectInput } from '@/data/contracts'
import { HttpProjectRepository } from '@/data/http/http-project-repository'
import type { Project } from '@/domain/models'

function stubResponse(body: unknown, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function lastRequest(fetchMock: ReturnType<typeof vi.fn>) {
  const calls = fetchMock.mock.calls
  const call = calls[calls.length - 1] as [string, RequestInit] | undefined
  return { url: call ? String(call[0]) : '', init: call?.[1] }
}

const project = {
  id: '30000000-0000-4000-8000-000000000001',
  code: 'PRJ-001',
  name: 'ERP',
  description: 'Implementación del ERP corporativo.',
  sector: 'technology',
  client: 'Grupo Andino',
  ownerId: '10000000-0000-4000-8000-000000000001',
  status: 'planned',
  priority: 'high',
  initialBudgetCents: 45000000,
  currentBudgetCents: 45000000,
  currency: 'PEN',
  progress: 0,
  startDate: '2026-11-01',
  dueDate: '2027-06-30',
  completedAt: null,
  tags: [],
  createdAt: '2026-11-01T12:00:00.000Z',
  updatedAt: '2026-11-01T12:00:00.000Z',
  archivedAt: null,
} satisfies Project

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://api.test/api/v1')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('HttpProjectRepository', () => {
  it('traduce filtros y paginación a query params del backend', async () => {
    const fetchMock = stubResponse({
      items: [project],
      total: 1,
      page: 2,
      pageSize: 10,
    })

    const result = await new HttpProjectRepository().list({
      page: 2,
      pageSize: 10,
      status: ['planned', 'in_progress'],
      search: 'ERP',
      includeArchived: true,
    })

    const { url } = lastRequest(fetchMock)
    expect(url).toContain('/projects?')
    expect(url).toContain('status=planned%2Cin_progress')
    expect(url).toContain('search=ERP')
    expect(url).toContain('includeArchived=true')
    expect(url).toContain('page=2')
    expect(url).toContain('pageSize=10')
    expect(result.items).toHaveLength(1)
  })

  it('devuelve null cuando el proyecto no existe', async () => {
    stubResponse(
      { error: { code: 'not_found', message: 'El proyecto no existe.' } },
      404,
    )

    const result = await new HttpProjectRepository().getById('missing')

    expect(result).toBeNull()
  })

  it('envía solo los campos permitidos al crear un proyecto', async () => {
    const fetchMock = stubResponse(project, 201)
    const input: CreateProjectInput = { ...project }
    delete (input as Partial<Project>).id
    delete (input as Partial<Project>).code
    delete (input as Partial<Project>).createdAt
    delete (input as Partial<Project>).updatedAt
    delete (input as Partial<Project>).archivedAt

    await new HttpProjectRepository().create(input)

    const { init } = lastRequest(fetchMock)
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>
    expect(init?.method).toBe('POST')
    expect(body).toMatchObject({
      name: 'ERP',
      ownerId: '10000000-0000-4000-8000-000000000001',
      initialBudgetCents: 45000000,
    })
    expect(body).not.toHaveProperty('id')
    expect(body).not.toHaveProperty('code')
  })
})
