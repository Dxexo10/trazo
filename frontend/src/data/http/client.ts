import { getApiBaseUrl } from '@/lib/api-config'
import type { Paginated } from '@/data/contracts'

const API_MAX_PAGE_SIZE = 100
const API_DEFAULT_PAGE_SIZE = 20

export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly (string | number)[]

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly details?: unknown

  constructor(
    message: string,
    status: number,
    code: string,
    details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

export function buildQueryString(
  query: Record<string, QueryValue> = {},
): string {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue

    if (Array.isArray(value)) {
      const items = value
        .filter((item) => item !== undefined && item !== null)
        .map((item) => String(item))

      if (items.length === 0) continue

      search.set(key, items.join(','))
      continue
    }

    if (typeof value === 'string' && value.trim() === '') continue

    search.set(key, String(value))
  }

  const queryString = search.toString()
  return queryString ? `?${queryString}` : ''
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH'
  query?: Record<string, QueryValue>
  body?: unknown
  signal?: AbortSignal
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl()

  if (!baseUrl) {
    throw new ApiError(
      'La API no está configurada. Define VITE_API_BASE_URL para usar el backend.',
      0,
      'missing_api_base_url',
    )
  }

  const url = `${baseUrl}${path}${buildQueryString(options.query)}`
  const hasBody = options.body !== undefined
  let response: Response

  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if ((error as { name?: string } | undefined)?.name === 'AbortError') {
      throw error
    }

    throw new ApiError(
      'No pudimos conectar con la API. Verifica que el backend esté en marcha.',
      0,
      'network_error',
    )
  }

  if (response.status === 204) return undefined as T

  const payload = await parseResponseBody(response)

  if (!response.ok) {
    const errorBody = payload as
      | {
          error?: { code?: string; message?: string; details?: unknown }
        }
      | null

    throw new ApiError(
      errorBody?.error?.message ??
        `La API respondió con el estado ${response.status}.`,
      response.status,
      errorBody?.error?.code ?? 'http_error',
      errorBody?.error?.details,
    )
  }

  return payload as T
}

export function apiGet<T>(
  path: string,
  query?: Record<string, QueryValue>,
): Promise<T> {
  return apiRequest<T>(path, { query })
}

/** Recorre todas las páginas del endpoint y devuelve la colección completa. */
export async function apiGetAllPages<T>(
  path: string,
  query: Record<string, QueryValue> = {},
): Promise<T[]> {
  const collected: T[] = []
  let page = 1

  for (;;) {
    const body = await apiRequest<Paginated<T>>(path, {
      query: { ...query, page, pageSize: API_MAX_PAGE_SIZE },
    })

    collected.push(...body.items)

    if (body.items.length === 0 || collected.length >= body.total) break

    page += 1
  }

  return collected
}

/**
 * Traduce una página del contrato del frontend al endpoint paginado del backend,
 * cuyo `pageSize` máximo es 100. Si se piden más filas de las permitidas, agrega
 * las páginas necesarias y devuelve la ventana solicitada.
 */
export async function apiList<T>(
  path: string,
  query: Record<string, QueryValue>,
  window: { page?: number; pageSize?: number },
): Promise<Paginated<T>> {
  const page = Math.max(1, window.page ?? 1)
  const pageSize = window.pageSize ?? API_DEFAULT_PAGE_SIZE

  if (pageSize <= API_MAX_PAGE_SIZE) {
    return apiRequest<Paginated<T>>(path, {
      query: { ...query, page, pageSize },
    })
  }

  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items: T[] = []
  let total: number | undefined
  let cursor = 1

  for (;;) {
    const body = await apiRequest<Paginated<T>>(path, {
      query: { ...query, page: cursor, pageSize: API_MAX_PAGE_SIZE },
    })

    total = body.total
    const offset = (cursor - 1) * API_MAX_PAGE_SIZE

    if (offset < end) {
      const sliceStart = Math.max(0, start - offset)
      const sliceEnd = Math.min(body.items.length, end - offset)
      if (sliceEnd > sliceStart) {
        items.push(...body.items.slice(sliceStart, sliceEnd))
      }
    }

    const reachedTotal = offset + body.items.length >= total
    if (body.items.length === 0 || reachedTotal || offset + body.items.length >= end)
      break

    cursor += 1
  }

  return { items, total: total ?? 0, page, pageSize }
}
