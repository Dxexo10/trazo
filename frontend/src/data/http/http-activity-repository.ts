import type { ActivityQuery, ActivityRepository } from '@/data/contracts'
import type { ActivityLog } from '@/domain/models'
import { apiGetAllPages, apiList } from './client'

export class HttpActivityRepository implements ActivityRepository {
  async list(query: ActivityQuery) {
    return apiList<ActivityLog>(
      '/activity',
      {
        projectId: query.projectId,
        actorId: query.actorId,
        action: query.action,
        source: query.source,
        createdAfter: query.createdAfter,
      },
      { page: query.page, pageSize: query.pageSize },
    )
  }

  async getAll(): Promise<ActivityLog[]> {
    return apiGetAllPages<ActivityLog>('/activity')
  }
}
