import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { activityRepository, projectRepository, userRepository } from '@/data'
import type { ActivityLog, Project, User } from '@/domain/models'
import { parseDate } from '@/domain/utils/date'
import type { Paginated } from '@/data/contracts'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import {
  ACTIVITY_PAGE_SIZE,
  type ActivityFilters,
  type ActivityPeriod,
} from './use-activity-filters'

export interface ActivityPageResult {
  page: Paginated<ActivityLog>
  projects: Project[]
  users: User[]
}

function periodStart(period: ActivityPeriod): string | undefined {
  if (period === 'all') return undefined

  const reference = parseDate(DEMO_REFERENCE_DATE)
  return new Date(
    reference.getTime() - Number(period) * 86_400_000,
  ).toISOString()
}

async function fetchActivity(
  filters: ActivityFilters,
): Promise<ActivityPageResult> {
  const [page, projects, users] = await Promise.all([
    activityRepository.list({
      projectId: filters.projectId || undefined,
      actorId: filters.actorId || undefined,
      action: filters.action === 'all' ? undefined : filters.action,
      source: filters.source === 'all' ? undefined : [filters.source],
      createdAfter: periodStart(filters.period),
      page: filters.page,
      pageSize: ACTIVITY_PAGE_SIZE,
    }),
    projectRepository.getAll(),
    userRepository.list(),
  ])

  return { page, projects, users }
}

export function useActivityQuery(filters: ActivityFilters) {
  return useQuery({
    queryKey: ['activity', 'page', filters],
    queryFn: () => fetchActivity(filters),
    placeholderData: keepPreviousData,
  })
}
