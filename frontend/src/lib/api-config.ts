function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim()

  if (!trimmed) return null

  return trimmed.replace(/\/+$/, '')
}

export function getApiBaseUrl(): string | null {
  return normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL)
}

const configuredBaseUrl = getApiBaseUrl()

export const API_BASE_URL = configuredBaseUrl

export const isHttpBackendEnabled =
  configuredBaseUrl !== null && import.meta.env.MODE !== 'test'
