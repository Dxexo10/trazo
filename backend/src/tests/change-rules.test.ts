import { describe, expect, it } from 'vitest'
import {
  DEFAULT_RULE_CONFIGS,
  type RuleConfig,
  type RuleKey,
} from '../domain/models/index.js'
import {
  evaluateChangeRules,
  type EvaluateChangeRulesInput,
} from '../domain/services/change-rules.js'
import { createProject } from './fixtures.js'

const REFERENCE_DATE = '2026-10-31'

function base(overrides: Partial<ReturnType<typeof createProject>> = {}) {
  return createProject({
    status: 'planned',
    priority: 'medium',
    progress: 0,
    currentBudgetCents: 100_000_000,
    dueDate: '2027-06-30',
    ...overrides,
  })
}

function evaluate(
  previous = base(),
  next = base(),
  options: Partial<Omit<EvaluateChangeRulesInput, 'previous' | 'next'>> = {},
) {
  return evaluateChangeRules({
    previous,
    next,
    referenceDate: REFERENCE_DATE,
    includeTimeRules: false,
    ...options,
  })
}

function withConfig(key: RuleKey, patch: Partial<RuleConfig>): RuleConfig[] {
  return DEFAULT_RULE_CONFIGS.map((config) =>
    config.ruleKey === key ? { ...config, ...patch } : config,
  )
}

describe('evaluateChangeRules — presupuesto', () => {
  it('no alerta en exactamente 10 %', () => {
    expect(evaluate(base(), base({ currentBudgetCents: 110_000_000 }))).toEqual(
      [],
    )
  })

  it('alerta como advertencia en exactamente 20 %', () => {
    const drafts = evaluate(base(), base({ currentBudgetCents: 120_000_000 }))

    expect(drafts).toHaveLength(1)
    expect(drafts[0]).toMatchObject({
      ruleKey: 'budget-increase-warning',
      severity: 'warning',
    })
  })

  it('alerta como crítico por encima del 20 % sin duplicar la advertencia', () => {
    const drafts = evaluate(base(), base({ currentBudgetCents: 120_000_100 }))

    expect(drafts).toHaveLength(1)
    expect(drafts[0]).toMatchObject({
      ruleKey: 'budget-increase-critical',
      severity: 'critical',
    })
  })

  it('usa la regla desde cero cuando el presupuesto anterior era cero', () => {
    const drafts = evaluate(
      base({ currentBudgetCents: 0 }),
      base({ currentBudgetCents: 5_000_000 }),
    )

    expect(drafts).toHaveLength(1)
    expect(drafts[0]).toMatchObject({
      ruleKey: 'budget-increase-from-zero',
      severity: 'critical',
    })
  })

  it('no alerta cuando el presupuesto disminuye', () => {
    expect(evaluate(base(), base({ currentBudgetCents: 80_000_000 }))).toEqual(
      [],
    )
  })

  it('respeta umbrales de advertencia personalizados', () => {
    const next = base({ currentBudgetCents: 106_000_000 })

    expect(evaluate(base(), next)).toEqual([])
    expect(
      evaluate(base(), next, {
        ruleConfigs: withConfig('budget-increase-warning', { threshold: 5 }),
      }),
    ).toHaveLength(1)
  })

  it('cae en la advertencia si la regla crítica está deshabilitada', () => {
    const drafts = evaluate(base(), base({ currentBudgetCents: 130_000_000 }), {
      ruleConfigs: withConfig('budget-increase-critical', { enabled: false }),
    })

    expect(drafts).toHaveLength(1)
    expect(drafts[0]?.ruleKey).toBe('budget-increase-warning')
  })

  it('omite reglas deshabilitadas', () => {
    expect(
      evaluate(base(), base({ currentBudgetCents: 115_000_000 }), {
        ruleConfigs: withConfig('budget-increase-warning', { enabled: false }),
      }),
    ).toEqual([])
  })
})

describe('evaluateChangeRules — fecha y reglas temporales', () => {
  it('alerta cuando la entrega se posterga', () => {
    const drafts = evaluate(
      base({ dueDate: '2026-12-01' }),
      base({ dueDate: '2026-12-15' }),
    )

    expect(drafts).toHaveLength(1)
    expect(drafts[0]).toMatchObject({ ruleKey: 'deadline-postponed' })
  })

  it('no alerta si la entrega se adelanta', () => {
    expect(
      evaluate(
        base({ dueDate: '2026-12-15' }),
        base({ dueDate: '2026-12-01' }),
      ),
    ).toEqual([])
  })

  it('evalúa vencimiento solo con reglas temporales activas', () => {
    const previous = base({ status: 'in_progress', progress: 40 })
    const next = base({
      status: 'in_progress',
      progress: 40,
      dueDate: '2026-09-30',
    })

    expect(evaluate(previous, next)).toEqual([])
    expect(evaluate(previous, next, { includeTimeRules: true })).toHaveLength(1)
  })

  it('no marca como vencido un proyecto completado', () => {
    const previous = base({ status: 'in_progress', progress: 90 })
    const next = base({
      status: 'completed',
      progress: 100,
      dueDate: '2026-09-30',
    })

    expect(evaluate(previous, next, { includeTimeRules: true })).toEqual([])
  })
})

describe('evaluateChangeRules — estado y prioridad', () => {
  it('alerta cuando el estado pasa a bloqueado', () => {
    const drafts = evaluate(
      base({ status: 'in_progress' }),
      base({ status: 'on_hold' }),
    )

    expect(drafts).toHaveLength(1)
    expect(drafts[0]).toMatchObject({
      ruleKey: 'project-on-hold',
      severity: 'critical',
    })
  })

  it('no repite la alerta si ya estaba bloqueado', () => {
    expect(
      evaluate(base({ status: 'on_hold' }), base({ status: 'on_hold' })),
    ).toEqual([])
  })

  it('alerta cuando la prioridad pasa a crítica', () => {
    const drafts = evaluate(
      base({ priority: 'high' }),
      base({ priority: 'critical' }),
    )

    expect(drafts).toHaveLength(1)
    expect(drafts[0]).toMatchObject({
      ruleKey: 'priority-critical',
      severity: 'warning',
    })
  })

  it('combina reglas independientes en una transición', () => {
    const drafts = evaluate(
      base({ status: 'in_progress', priority: 'medium' }),
      base({
        status: 'on_hold',
        priority: 'critical',
        currentBudgetCents: 125_000_000,
        dueDate: '2027-08-30',
      }),
    )

    expect(drafts.map((draft) => draft.ruleKey)).toEqual([
      'budget-increase-critical',
      'deadline-postponed',
      'project-on-hold',
      'priority-critical',
    ])
  })
})
