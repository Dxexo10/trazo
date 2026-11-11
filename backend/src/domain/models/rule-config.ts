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

export const DEFAULT_RULE_CONFIGS: readonly RuleConfig[] = [
  {
    id: '70000000-0000-4000-8000-000000000001',
    ruleKey: 'budget-increase-from-zero',
    enabled: true,
    threshold: null,
    severity: 'critical',
  },
  {
    id: '70000000-0000-4000-8000-000000000002',
    ruleKey: 'budget-increase-critical',
    enabled: true,
    threshold: 20,
    severity: 'critical',
  },
  {
    id: '70000000-0000-4000-8000-000000000003',
    ruleKey: 'budget-increase-warning',
    enabled: true,
    threshold: 10,
    severity: 'warning',
  },
  {
    id: '70000000-0000-4000-8000-000000000004',
    ruleKey: 'deadline-postponed',
    enabled: true,
    threshold: 0,
    severity: 'warning',
  },
  {
    id: '70000000-0000-4000-8000-000000000005',
    ruleKey: 'project-overdue',
    enabled: true,
    threshold: 0,
    severity: 'warning',
  },
  {
    id: '70000000-0000-4000-8000-000000000006',
    ruleKey: 'project-on-hold',
    enabled: true,
    threshold: null,
    severity: 'critical',
  },
  {
    id: '70000000-0000-4000-8000-000000000007',
    ruleKey: 'priority-critical',
    enabled: true,
    threshold: null,
    severity: 'warning',
  },
]
