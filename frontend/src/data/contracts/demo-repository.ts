import type { SimulationScenario } from '@/domain/scenarios'
import type { ProjectUpdateResult } from './project-repository'

export interface DemoRepository {
  reset(): Promise<void>
  runScenario(
    scenarioId: SimulationScenario,
    projectId: string,
  ): Promise<ProjectUpdateResult>
}
