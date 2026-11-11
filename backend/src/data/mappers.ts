import type {
  ActivityLog as ActivityRecord,
  Alert as AlertRecord,
  ChangeEvent as ChangeRecord,
  Project as ProjectRecord,
  ProjectVersion as VersionRecord,
  RuleConfig as RuleRecord,
} from '@prisma/client'
import type {
  ActivityLog,
  Alert,
  AlertSeverity,
  ChangeEvent,
  ChangeType,
  Project,
  ProjectVersion,
  RuleConfig,
  RuleKey,
  Sector,
  VersionSource,
} from '../domain/models/index.js'

export function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export function toDateOnly(value: Date): string {
  return value.toISOString().slice(0, 10)
}

export function toOptionalDateOnly(value: Date | null): string | null {
  return value ? toDateOnly(value) : null
}

export function toProject(record: ProjectRecord): Project {
  return {
    id: record.id,
    code: record.code,
    name: record.name,
    description: record.description,
    sector: record.sector as Sector,
    client: record.client,
    ownerId: record.ownerId,
    status: record.status as Project['status'],
    priority: record.priority as Project['priority'],
    initialBudgetCents: record.initialBudgetCents,
    currentBudgetCents: record.currentBudgetCents,
    currency: record.currency as Project['currency'],
    progress: record.progress,
    startDate: toDateOnly(record.startDate),
    dueDate: toDateOnly(record.dueDate),
    completedAt: toOptionalDateOnly(record.completedAt),
    tags: parseJson<string[]>(record.tags, []),
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null,
  }
}

export function toProjectVersion(record: VersionRecord): ProjectVersion {
  return {
    id: record.id,
    projectId: record.projectId,
    versionNumber: record.versionNumber,
    snapshot: parseJson<Project>(record.snapshot, {
      id: record.projectId,
    } as Project),
    changedAt: record.changedAt.toISOString(),
    changedBy: record.changedBy,
    source: record.source as VersionSource,
    reason: record.reason,
  }
}

export function toChangeEvent(record: ChangeRecord): ChangeEvent {
  return {
    id: record.id,
    versionId: record.versionId,
    projectId: record.projectId,
    field: record.field as ChangeType,
    oldValue: record.oldValue,
    newValue: record.newValue,
    changeType: record.changeType as ChangeType,
  }
}

export function toAlert(record: AlertRecord): Alert {
  return {
    id: record.id,
    projectId: record.projectId,
    ...(record.versionId ? { versionId: record.versionId } : {}),
    ruleId: record.ruleId,
    severity: record.severity as AlertSeverity,
    status: record.status as Alert['status'],
    title: record.title,
    description: record.description,
    createdAt: record.createdAt.toISOString(),
    reviewedAt: record.reviewedAt ? record.reviewedAt.toISOString() : null,
    resolvedAt: record.resolvedAt ? record.resolvedAt.toISOString() : null,
  }
}

export function toActivityLog(record: ActivityRecord): ActivityLog {
  return {
    id: record.id,
    projectId: record.projectId,
    actorId: record.actorId,
    action: record.action,
    source: record.source as ActivityLog['source'],
    createdAt: record.createdAt.toISOString(),
    metadata: parseJson<Record<string, string>>(record.metadata, {}),
  }
}

export function toRuleConfig(record: RuleRecord): RuleConfig {
  return {
    id: record.id,
    ruleKey: record.ruleKey as RuleKey,
    enabled: record.enabled,
    threshold: record.threshold,
    severity: record.severity as AlertSeverity,
  }
}
