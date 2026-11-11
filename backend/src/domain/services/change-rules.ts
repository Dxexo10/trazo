import type {
  AlertSeverity,
  Project,
  RuleConfig,
  RuleKey,
} from '../models/index.js'
import { DEFAULT_RULE_CONFIGS } from '../models/rule-config.js'
import { daysBetween, formatDate } from '../utils/date.js'
import { percentageChange } from '../utils/money.js'

export interface AlertDraft {
  ruleKey: RuleKey
  severity: AlertSeverity
  title: string
  description: string
}

export interface EvaluateChangeRulesInput {
  previous: Project
  next: Project
  ruleConfigs?: readonly RuleConfig[]
  referenceDate: string
  includeTimeRules?: boolean
}

const DEFAULT_CONFIG_BY_KEY = new Map(
  DEFAULT_RULE_CONFIGS.map((config) => [config.ruleKey, config]),
)

function resolveConfig(
  configs: readonly RuleConfig[] | undefined,
  key: RuleKey,
): RuleConfig {
  return (
    configs?.find((config) => config.ruleKey === key) ??
    DEFAULT_CONFIG_BY_KEY.get(key) ?? {
      id: `rule_${key}`,
      ruleKey: key,
      enabled: true,
      threshold: null,
      severity: 'warning',
    }
  )
}

function formatVariation(value: number): string {
  return `${Math.abs(value).toFixed(1).replace('.', ',')} %`
}

function budgetDrafts(
  previous: Project,
  next: Project,
  configs: readonly RuleConfig[] | undefined,
): AlertDraft[] {
  const previousBudget = previous.currentBudgetCents
  const nextBudget = next.currentBudgetCents

  if (previousBudget === nextBudget) return []

  const fromZero = resolveConfig(configs, 'budget-increase-from-zero')
  if (previousBudget === 0 && nextBudget > 0) {
    if (!fromZero.enabled) return []
    return [
      {
        ruleKey: fromZero.ruleKey,
        severity: fromZero.severity,
        title: 'Presupuesto asignado desde cero',
        description:
          'El proyecto no tenía presupuesto registrado y ahora tiene un monto asignado.',
      },
    ]
  }

  if (previousBudget <= 0) return []

  const variation = percentageChange(previousBudget, nextBudget)
  if (variation === null || variation <= 0) return []

  const critical = resolveConfig(configs, 'budget-increase-critical')
  const warning = resolveConfig(configs, 'budget-increase-warning')
  const criticalThreshold = critical.threshold ?? 20
  const warningThreshold = warning.threshold ?? 10

  if (critical.enabled && variation > criticalThreshold) {
    return [
      {
        ruleKey: critical.ruleKey,
        severity: critical.severity,
        title: 'Incremento presupuestal crítico',
        description: `El presupuesto actual aumentó un ${formatVariation(variation)} respecto a la versión anterior.`,
      },
    ]
  }

  if (warning.enabled && variation > warningThreshold) {
    return [
      {
        ruleKey: warning.ruleKey,
        severity: warning.severity,
        title: 'Incremento presupuestal relevante',
        description: `El presupuesto actual aumentó un ${formatVariation(variation)} respecto a la versión anterior.`,
      },
    ]
  }

  return []
}

function deadlineDraft(
  previous: Project,
  next: Project,
  configs: readonly RuleConfig[] | undefined,
): AlertDraft[] {
  if (next.dueDate <= previous.dueDate) return []

  const config = resolveConfig(configs, 'deadline-postponed')
  if (!config.enabled) return []

  const postponedDays = daysBetween(previous.dueDate, next.dueDate)
  if (postponedDays <= (config.threshold ?? 0)) return []

  return [
    {
      ruleKey: config.ruleKey,
      severity: config.severity,
      title: 'Fecha de entrega postergada',
      description: `La entrega pasó de ${formatDate(previous.dueDate)} a ${formatDate(next.dueDate)} (${postponedDays} ${postponedDays === 1 ? 'día' : 'días'} de postergación).`,
    },
  ]
}

function overdueDraft(
  next: Project,
  referenceDate: string,
  configs: readonly RuleConfig[] | undefined,
): AlertDraft[] {
  if (next.status !== 'in_progress' && next.status !== 'on_hold') return []
  if (next.progress >= 100) return []

  const config = resolveConfig(configs, 'project-overdue')
  if (!config.enabled) return []

  const overdueDays = daysBetween(next.dueDate, referenceDate)
  if (overdueDays <= (config.threshold ?? 0)) return []

  return [
    {
      ruleKey: config.ruleKey,
      severity: config.severity,
      title: 'Proyecto vencido',
      description: `La fecha de entrega venció hace ${overdueDays} ${overdueDays === 1 ? 'día' : 'días'} con un avance del ${next.progress} %.`,
    },
  ]
}

function statusDraft(
  previous: Project,
  next: Project,
  configs: readonly RuleConfig[] | undefined,
): AlertDraft[] {
  if (previous.status === 'on_hold' || next.status !== 'on_hold') return []

  const config = resolveConfig(configs, 'project-on-hold')
  if (!config.enabled) return []

  return [
    {
      ruleKey: config.ruleKey,
      severity: config.severity,
      title: 'Proyecto bloqueado',
      description:
        'El estado del proyecto cambió a Bloqueado y requiere seguimiento del responsable.',
    },
  ]
}

function priorityDraft(
  previous: Project,
  next: Project,
  configs: readonly RuleConfig[] | undefined,
): AlertDraft[] {
  if (previous.priority === 'critical' || next.priority !== 'critical')
    return []

  const config = resolveConfig(configs, 'priority-critical')
  if (!config.enabled) return []

  return [
    {
      ruleKey: config.ruleKey,
      severity: config.severity,
      title: 'Prioridad crítica asignada',
      description:
        'El proyecto pasó a prioridad crítica y debe revisarse en la reunión de portafolio.',
    },
  ]
}

export function evaluateChangeRules({
  previous,
  next,
  ruleConfigs,
  referenceDate,
  includeTimeRules = true,
}: EvaluateChangeRulesInput): AlertDraft[] {
  return [
    ...budgetDrafts(previous, next, ruleConfigs),
    ...deadlineDraft(previous, next, ruleConfigs),
    ...(includeTimeRules ? overdueDraft(next, referenceDate, ruleConfigs) : []),
    ...statusDraft(previous, next, ruleConfigs),
    ...priorityDraft(previous, next, ruleConfigs),
  ]
}
