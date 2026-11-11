import type {
  Alert,
  AlertStatus,
  ProjectVersion,
  RuleConfig,
} from '../models/index.js'
import { evaluateChangeRules } from '../services/change-rules.js'
import { parseDate } from '../utils/date.js'
import { DEMO_REFERENCE_DATE } from '../../lib/demo-config.js'
import { stableId } from './random.js'

function statusFor(index: number): AlertStatus {
  if (index % 7 === 0) return 'resolved'
  if (index % 5 === 0) return 'reviewed'
  return 'open'
}

function groupByProject(
  versions: readonly ProjectVersion[],
): Map<string, ProjectVersion[]> {
  const grouped = new Map<string, ProjectVersion[]>()

  for (const version of versions) {
    const bucket = grouped.get(version.projectId)
    if (bucket) {
      bucket.push(version)
    } else {
      grouped.set(version.projectId, [version])
    }
  }

  for (const bucket of grouped.values()) {
    bucket.sort((a, b) => a.versionNumber - b.versionNumber)
  }

  return grouped
}

export function generateAlerts(
  versions: readonly ProjectVersion[],
  ruleConfigs: readonly RuleConfig[],
): Alert[] {
  const referenceTime = parseDate(DEMO_REFERENCE_DATE).getTime()
  const alerts: Alert[] = []
  const seen = new Set<string>()

  for (const projectVersions of groupByProject(versions).values()) {
    for (let index = 1; index < projectVersions.length; index += 1) {
      const previous = projectVersions[index - 1]
      const current = projectVersions[index]
      if (!previous || !current) continue
      if (current.snapshot.status === 'cancelled') continue

      const drafts = evaluateChangeRules({
        previous: previous.snapshot,
        next: current.snapshot,
        ruleConfigs,
        referenceDate: DEMO_REFERENCE_DATE,
        includeTimeRules: index === projectVersions.length - 1,
      })

      for (const draft of drafts) {
        const dedupeKey = `${current.id}:${draft.ruleKey}`
        if (seen.has(dedupeKey)) continue
        seen.add(dedupeKey)

        const status = statusFor(alerts.length)
        const changedAt = parseDate(current.changedAt).getTime()
        const createdAtTime = Math.min(
          referenceTime,
          changedAt + (alerts.length % 5) * 3_600_000,
        )
        const reviewedAtTime = Math.min(
          referenceTime,
          createdAtTime + (6 + (alerts.length % 60)) * 3_600_000,
        )

        alerts.push({
          id: stableId(5, alerts.length + 1),
          projectId: current.projectId,
          versionId: current.id,
          ruleId: draft.ruleKey,
          severity: draft.severity,
          status,
          title: draft.title,
          description: draft.description,
          createdAt: new Date(createdAtTime).toISOString(),
          reviewedAt:
            status === 'open' ? null : new Date(reviewedAtTime).toISOString(),
          resolvedAt:
            status === 'resolved'
              ? new Date(reviewedAtTime).toISOString()
              : null,
        })
      }
    }
  }

  return alerts.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
