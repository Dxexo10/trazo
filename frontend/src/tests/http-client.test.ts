import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  apiGet,
  apiGetAllPages,
  apiList,
  apiRequest,
  buildQueryString,
  isNotFoundError,
} from '@/data/http/client'

interface FakeResponse {
  status: number
  ok: boolean
  text: () => Promise<string>
}

function stubResponse(body: unknown, status = 200) {
  const response: FakeResponse = {
    status,
    ok: status >= 200 && status < 300,
    text: async () => (body === undefined ? '' : JSON.stringify(body)),
  }
  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

function lastRequest(fetchMock: ReturnType<typeof vi.fn>) {
  const calls = fetchMock.mock.calls
  const call = calls[calls.length - 1] as [string, RequestInit] | undefined
  return {
    url: call ? String(call[0]) : '',
    init: call?.[1],
  }
}

beforeEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', 'http://api.test/api/v1')
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('buildQueryString', () => {
  it('serializa arrays como CSV y omite valores vacíos', () => {
    const query = buildQueryString({
      status: ['open', 'reviewed'],
      search: '   ',
      page: 2,
      includeArchived: true,
      projectId: undefined,
      severity: [],
    })

    expect(query).toBe('?status=open%2Creviewed&page=2&includeArchived=true')
  })

  it('devuelve cadena vacía si no hay parámetros utilizables', () => {
    expect(buildQueryString({ search: undefined, status: [] })).toBe('')
  })
})

describe('apiRequest', () => {
  it('compone la URL con la base configurada y parsea el JSON', async () => {
    const fetchMock = stubResponse({ ok: true })

    const result = await apiGet<{ ok: boolean }>('/health')

    expect(result).toEqual({ ok: true })
    expect(lastRequest(fetchMock).url).toBe('http://api.test/api/v1/health')
  })

  it('lanza ApiError con el mensaje del backend', async () => {
    stubResponse(
      {
        error: {
          code: 'validation_error',
          message: 'La petición no es válida.',
        },
      },
      400,
    )

    await expect(apiGet('/projects')).rejects.toMatchObject({
      name: 'ApiError',
      status: 400,
      code: 'validation_error',
      message: 'La petición no es válida.',
    })
  })

  it('marca los 404 con isNotFoundError', async () => {
    stubResponse(
      { error: { code: 'not_found', message: 'El proyecto no existe.' } },
      404,
    )

    const error = await apiGet('/projects/nope').catch((cause) => cause)

    expect(error).toBeInstanceOf(ApiError)
    expect(isNotFoundError(error)).toBe(true)
  })

  it('devuelve undefined en respuestas 204', async () => {
    stubResponse(undefined, 204)

    await expect(
      apiRequest('/projects/1/archive', { method: 'POST' }),
    ).resolves.toBeUndefined()
  })
})

describe('apiGetAllPages', () => {
  it('recorre las páginas hasta cubrir el total', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({ items: [1, 2], total: 3, page: 1, pageSize: 100 }),
      })
      .mockResolvedValueOnce({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({ items: [3], total: 3, page: 2, pageSize: 100 }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const items = await apiGetAllPages<number>('/activity', {
      source: 'manual',
    })

    expect(items).toEqual([1, 2, 3])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(lastRequest(fetchMock).url).toContain('page=2')
  })
})

describe('apiList', () => {
  it('agrega páginas cuando el pageSize solicitado supera el máximo del backend', async () => {
    const fetchMock = vi.fn().mockImplementation((url: string) => {
      const page = Number(new URL(url).searchParams.get('page'))
      const items =
        page === 1 ? Array.from({ length: 100 }, (_, i) => i) : [100]

      return Promise.resolve({
        status: 200,
        ok: true,
        text: async () =>
          JSON.stringify({ items, total: 101, page, pageSize: 100 }),
      })
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await apiList<number>(
      '/projects',
      {},
      { page: 1, pageSize: 250 },
    )

    expect(result.items).toHaveLength(101)
    expect(result.pageSize).toBe(250)
    expect(result.total).toBe(101)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
