import { describe, expect, it } from 'vitest'
import {
  runScenarioSchema,
  scenarioIdParamSchema,
} from '../domain/schemas/demo.js'
import { SCENARIOS, SIMULATION_SCENARIOS } from '../domain/scenarios.js'
import { createProject } from './fixtures.js'

describe('demo scenarios', () => {
  it('registra los cuatro escenarios previstos', () => {
    expect(SIMULATION_SCENARIOS).toEqual([
      'budget-increase',
      'deadline-postponed',
      'project-on-hold',
      'priority-critical',
    ])
  })

  it('incrementa el presupuesto actual un 15 %', () => {
    const input = SCENARIOS['budget-increase'].buildInput(
      createProject({ currentBudgetCents: 100_000_000 }),
    )

    expect(input).toEqual({ currentBudgetCents: 115_000_000 })
  })

  it('parte de 50.000.000 de céntimos cuando el presupuesto es cero', () => {
    const input = SCENARIOS['budget-increase'].buildInput(
      createProject({ currentBudgetCents: 0 }),
    )

    expect(input).toEqual({ currentBudgetCents: 50_000_000 })
  })

  it('posterga la entrega 30 días', () => {
    const input = SCENARIOS['deadline-postponed'].buildInput(
      createProject({ dueDate: '2026-09-30' }),
    )

    expect(input).toEqual({ dueDate: '2026-10-30' })
  })

  it('bloquea el proyecto y eleva la prioridad', () => {
    expect(
      SCENARIOS['project-on-hold'].buildInput(createProject()),
    ).toEqual({ status: 'on_hold' })
    expect(
      SCENARIOS['priority-critical'].buildInput(createProject()),
    ).toEqual({ priority: 'critical' })
  })

  it('valida el id del escenario y el proyecto destino', () => {
    expect(scenarioIdParamSchema.safeParse({ id: 'nope' }).success).toBe(false)
    expect(
      scenarioIdParamSchema.safeParse({ id: 'budget-increase' }).success,
    ).toBe(true)
    expect(runScenarioSchema.safeParse({}).success).toBe(false)
    expect(
      runScenarioSchema.safeParse({ projectId: 'not-a-uuid' }).success,
    ).toBe(false)
    expect(
      runScenarioSchema.safeParse({
        projectId: '30000000-0000-4000-8000-000000000001',
      }).success,
    ).toBe(true)
  })
})
