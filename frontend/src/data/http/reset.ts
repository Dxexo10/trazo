import { apiRequest } from './client'

/** Repuebla la base SQL Server con el dataset demo determinista. */
export async function resetDemoData(): Promise<void> {
  await apiRequest('/demo/reset', { method: 'POST' })
}
