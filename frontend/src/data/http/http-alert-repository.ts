import type { AlertQuery, AlertRepository } from '@/data/contracts'
import type { Alert, AlertStatus } from '@/domain/models'
import {
  apiGet,
  apiGetAllPages,
  apiList,
  apiRequest,
  isNotFoundError,
} from './client'

export class HttpAlertRepository implements AlertRepository {
  async list(query: AlertQuery) {
    return apiList<Alert>(
      '/alerts',
      {
        status: query.status,
        severity: query.severity,
        projectId: query.projectId,
        createdAfter: query.createdAfter,
      },
      { page: query.page, pageSize: query.pageSize },
    )
  }

  async getAll(): Promise<Alert[]> {
    return apiGetAllPages<Alert>('/alerts')
  }

  async getById(id: string): Promise<Alert | null> {
    try {
      return await apiGet<Alert>(`/alerts/${encodeURIComponent(id)}`)
    } catch (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
  }

  async updateStatus(id: string, status: AlertStatus): Promise<Alert> {
    return apiRequest<Alert>(`/alerts/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: { status },
    })
  }

  async countOpen(): Promise<number> {
    const body = await apiGet<{ count: number }>('/alerts/count-open')
    return body.count
  }
}
