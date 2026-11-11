import type {
  ChangeEventRepository,
  ChangeQuery,
} from '@/data/contracts'
import type { ChangeEvent } from '@/domain/models'
import { apiGetAllPages, apiList } from './client'

export class HttpChangeEventRepository implements ChangeEventRepository {
  async getAll(): Promise<ChangeEvent[]> {
    return apiGetAllPages<ChangeEvent>('/changes')
  }

  async listByProject(projectId: string): Promise<ChangeEvent[]> {
    return apiGetAllPages<ChangeEvent>('/changes', { projectId })
  }

  async listByVersion(versionId: string): Promise<ChangeEvent[]> {
    return apiGetAllPages<ChangeEvent>('/changes', { versionId })
  }

  async list(query: ChangeQuery = {}) {
    return apiList<ChangeEvent>(
      '/changes',
      {
        projectId: query.projectId,
        versionId: query.versionId,
        field: query.field,
      },
      { page: query.page, pageSize: query.pageSize },
    )
  }
}
