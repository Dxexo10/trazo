export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const

export type AlertSeverity = (typeof ALERT_SEVERITIES)[number]

export const ALERT_STATUSES = ['open', 'reviewed', 'resolved'] as const

export type AlertStatus = (typeof ALERT_STATUSES)[number]

export interface Alert {
  id: string
  projectId: string
  versionId?: string
  ruleId: string
  severity: AlertSeverity
  status: AlertStatus
  title: string
  description: string
  createdAt: string
  reviewedAt: string | null
  resolvedAt: string | null
}
