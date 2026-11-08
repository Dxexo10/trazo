import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { projectRepository, type ProjectQuery } from '@/data'
import { assessProjectRisk } from '@/domain/services/project-metrics'
import {
  DEMO_REFERENCE_DATE,
  PROJECT_QUERY_MAX_PAGE_SIZE,
} from '@/lib/demo-config'
import { PROJECTS_PAGE_SIZE, type ProjectFilters } from './use-project-filters'

function toQuery(filters: ProjectFilters): ProjectQuery {
  return {
    page: filters.page,
    pageSize: PROJECTS_PAGE_SIZE,
    search: filters.search || undefined,
    status: filters.status === 'all' ? undefined : [filters.status],
    priority: filters.priority === 'all' ? undefined : [filters.priority],
    sector: filters.sector === 'all' ? undefined : [filters.sector],
    ownerId: filters.ownerId || undefined,
    includeArchived: filters.archived === 'include',
    onlyArchived: filters.archived === 'only',
    sortBy: filters.sortBy,
    sortDirection: filters.sortDirection,
  }
}

export function useProjectsQuery(filters: ProjectFilters) {
  return useQuery({
    queryKey: ['projects', 'list', filters],
    queryFn: async () => {
      if (filters.risk === 'all') {
        return projectRepository.list(toQuery(filters))
      }

      const wanted = filters.risk === 'alto' ? 'high' : 'medium'
      const all = await projectRepository.list({
        ...toQuery(filters),
        page: 1,
        pageSize: PROJECT_QUERY_MAX_PAGE_SIZE,
      })
      const matching = all.items.filter(
        (project) =>
          assessProjectRisk(project, DEMO_REFERENCE_DATE).level === wanted,
      )
      const start = (filters.page - 1) * PROJECTS_PAGE_SIZE

      return {
        items: matching.slice(start, start + PROJECTS_PAGE_SIZE),
        total: matching.length,
        page: filters.page,
        pageSize: PROJECTS_PAGE_SIZE,
      }
    },
    placeholderData: keepPreviousData,
  })
}
