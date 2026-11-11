import type { DemoRepository, ProjectUpdateResult } from '@/data/contracts'
import type { SimulationScenario } from '@/domain/scenarios'
import { SCENARIOS } from '@/domain/scenarios'
import { DEMO_CURRENT_USER } from '../seed/users'
import { applyProjectUpdate } from '../services/apply-project-update'
import { getDatabase, resetDemoData } from '../storage/db'
import { withLatency } from './latency'

export class MockDemoRepository implements DemoRepository {
  async reset(): Promise<void> {
    await resetDemoData()
  }

  async runScenario(
    scenarioId: SimulationScenario,
    projectId: string,
  ): Promise<ProjectUpdateResult> {
    const db = await getDatabase()
    const existing = await db.get('projects', projectId)

    if (!existing) {
      throw new Error('El proyecto solicitado no existe.')
    }

    const scenario = SCENARIOS[scenarioId]
    const result = await applyProjectUpdate(
      db,
      projectId,
      scenario.buildInput(existing),
      {
        actorId: DEMO_CURRENT_USER.id,
        source: 'simulated',
        reason: scenario.reason,
      },
    )

    return withLatency(result)
  }
}
