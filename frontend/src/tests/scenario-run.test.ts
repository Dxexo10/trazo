import { beforeEach, describe, expect, it } from 'vitest'
import { demoRepository, projectRepository, resetDemoData } from '@/data'

describe('demo scenarios', () => {
  beforeEach(async () => {
    await resetDemoData()
  })

  it('aplica un escenario con versión simulada y reglas', async () => {
    const project = await projectRepository.getById('prj_0001')
    expect(project).not.toBeNull()
    if (!project) return

    const result = await demoRepository.runScenario(
      'budget-increase',
      project.id,
    )

    expect(result.changed).toBe(true)
    expect(result.version?.source).toBe('simulated')
    expect(result.version?.reason).toContain('15 %')
    expect(result.project.currentBudgetCents).toBe(
      Math.round(project.currentBudgetCents * 1.15),
    )
    expect(result.changes.some((change) => change.field === 'budget')).toBe(
      true,
    )
    expect(result.alerts.length).toBeGreaterThan(0)
  })

  it('falla si el proyecto no existe', async () => {
    await expect(
      demoRepository.runScenario('project-on-hold', 'prj_missing'),
    ).rejects.toThrow('El proyecto solicitado no existe.')
  })
})
