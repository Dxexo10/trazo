import type { Project } from './models/index.js'
import type { UpdateProjectInput } from './schemas/index.js'
import { addDays, parseDate, toISODate } from './utils/date.js'

export const SIMULATION_SCENARIOS = [
  'budget-increase',
  'deadline-postponed',
  'project-on-hold',
  'priority-critical',
] as const

export type SimulationScenario = (typeof SIMULATION_SCENARIOS)[number]

export interface ScenarioDefinition {
  id: SimulationScenario
  label: string
  description: string
  reason: string
  buildInput: (project: Project) => UpdateProjectInput
}

export const SCENARIOS: Record<SimulationScenario, ScenarioDefinition> = {
  'budget-increase': {
    id: 'budget-increase',
    label: 'Incremento de presupuesto (+15 %)',
    description:
      'Sube el presupuesto actual un 15 % y dispara la regla de incremento relevante o crítico.',
    reason: 'Simulación demo: incremento presupuestal del 15 %.',
    buildInput: (project) => ({
      currentBudgetCents:
        project.currentBudgetCents === 0
          ? 50_000_000
          : Math.round(project.currentBudgetCents * 1.15),
    }),
  },
  'deadline-postponed': {
    id: 'deadline-postponed',
    label: 'Postergar entrega (+30 días)',
    description:
      'Mueve la fecha de entrega 30 días y dispara la regla de postergación.',
    reason: 'Simulación demo: entrega postergada 30 días.',
    buildInput: (project) => ({
      dueDate: toISODate(addDays(parseDate(project.dueDate), 30)),
    }),
  },
  'project-on-hold': {
    id: 'project-on-hold',
    label: 'Bloquear proyecto',
    description:
      'Cambia el estado a Bloqueado y dispara la regla crítica de seguimiento.',
    reason: 'Simulación demo: proyecto bloqueado.',
    buildInput: () => ({ status: 'on_hold' }),
  },
  'priority-critical': {
    id: 'priority-critical',
    label: 'Prioridad crítica',
    description:
      'Cambia la prioridad a Crítica y dispara la regla de prioridad.',
    reason: 'Simulación demo: prioridad elevada a crítica.',
    buildInput: () => ({ priority: 'critical' }),
  },
}
