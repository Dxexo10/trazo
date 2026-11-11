import type { DemoRepository, ProjectUpdateResult } from '@/data/contracts'
import type { SimulationScenario } from '@/domain/scenarios'
import { apiRequest } from './client'

export class HttpDemoRepository implements DemoRepository {
  async reset(): Promise<void> {
    await apiRequest('/demo/reset', { method: 'POST' })
  }

  async runScenario(
    scenarioId: SimulationScenario,
    projectId: string,
  ): Promise<ProjectUpdateResult> {
    return apiRequest<ProjectUpdateResult>(
      `/demo/scenarios/${encodeURIComponent(scenarioId)}/run`,
      { method: 'POST', body: { projectId } },
    )
  }
}
