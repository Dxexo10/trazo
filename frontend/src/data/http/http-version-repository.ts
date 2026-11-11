import type { VersionQuery, VersionRepository } from '@/data/contracts'
import type { ProjectVersion } from '@/domain/models'
import { apiGet, apiGetAllPages, apiList, isNotFoundError } from './client'

export class HttpVersionRepository implements VersionRepository {
  async getAll(): Promise<ProjectVersion[]> {
    return apiGetAllPages<ProjectVersion>('/versions')
  }

  async getById(id: string): Promise<ProjectVersion | null> {
    try {
      return await apiGet<ProjectVersion>(`/versions/${encodeURIComponent(id)}`)
    } catch (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
  }

  async listByProject(projectId: string): Promise<ProjectVersion[]> {
    return apiGetAllPages<ProjectVersion>('/versions', { projectId })
  }

  async list(query: VersionQuery = {}) {
    return apiList<ProjectVersion>(
      '/versions',
      {
        projectId: query.projectId,
        from: query.from,
        to: query.to,
      },
      { page: query.page, pageSize: query.pageSize },
    )
  }
}
