import { useQuery } from '@tanstack/react-query'
import {
  activityRepository,
  alertRepository,
  projectRepository,
  userRepository,
} from '@/data'
import type { ActivityLog, Project, User } from '@/domain/models'
import {
  buildDashboardSummary,
  type DashboardPeriod,
  type DashboardSummary,
} from '@/domain/services/dashboard-summary'
import { DEMO_REFERENCE_DATE } from '@/lib/demo-config'

export interface DashboardData {
  summary: DashboardSummary
  activity: ActivityLog[]
  projects: Project[]
  users: User[]
}

async function fetchDashboard(period: DashboardPeriod): Promise<DashboardData> {
  const [projects, alerts, activity, users] = await Promise.all([
    projectRepository.getAll(),
    alertRepository.getAll(),
    activityRepository.list({ page: 1, pageSize: 8 }),
    userRepository.list(),
  ])

  return {
    summary: buildDashboardSummary({
      projects,
      alerts,
      filters: { periodMonths: period },
      referenceDate: DEMO_REFERENCE_DATE,
    }),
    activity: activity.items,
    projects,
    users,
  }
}

export function useDashboardSummary(period: DashboardPeriod) {
  return useQuery({
    queryKey: ['dashboard', 'summary', period],
    queryFn: () => fetchDashboard(period),
  })
}
