import type { AlertSeverity } from './alert.js'

export const RULE_KEYS = [
  'budget-increase-from-zero',
  'budget-increase-critical',
  'budget-increase-warning',
  'deadline-postponed',
  'project-overdue',
  'project-on-hold',
  'priority-critical',
] as const

export type RuleKey = (typeof RULE_KEYS)[number]

export interface RuleConfig {
  id: string
  ruleKey: RuleKey
  enabled: boolean
  threshold: number | null
  severity: AlertSeverity
}
