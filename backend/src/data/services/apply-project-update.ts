import { randomUUID } from 'node:crypto'
import type { Prisma } from '@prisma/client'
import type {
  Alert,
  ChangeEvent,
  Project,
  ProjectVersion,
} from '../../domain/models/index.js'
import type { UpdateProjectInput } from '../../domain/schemas/index.js'
import { evaluateChangeRules } from '../../domain/services/change-rules.js'
import { diffProject } from '../../domain/services/project-diff.js'
import { parseDate } from '../../domain/utils/date.js'
import { DEFAULT_RULE_CONFIGS } from '../../domain/models/rule-config.js'
import { DEMO_REFERENCE_DATE } from '../../lib/demo-config.js'
import { AppError, NotFoundError } from '../../lib/errors.js'
import { toProject, toRuleConfig } from '../mappers.js'

export interface ProjectWriteOptions {
  actorId: string
  source: ProjectVersion['source']
  now?: string
}

export interface UpdateProjectOptions extends ProjectWriteOptions {
  reason?: string
}

export interface ProjectUpdateResult {
  project: Project
  changed: boolean
  version: ProjectVersion | null
  changes: ChangeEvent[]
  alerts: Alert[]
}

function validateMergedProject(project: Project): void {
  if (project.dueDate < project.startDate) {
    throw new AppError(
      400,
      'invalid_project',
      'La fecha de entrega no puede ser anterior al inicio.',
    )
  }

  if (project.status === 'completed') {
    if (project.progress !== 100) {
      throw new AppError(
        400,
        'invalid_project',
        'Un proyecto completado debe tener 100 % de avance.',
      )
    }

    if (!project.completedAt) {
      throw new AppError(
        400,
        'invalid_project',
        'Un proyecto completado requiere fecha de cierre.',
      )
    }
  }
}

export async function applyProjectUpdate(
  tx: Prisma.TransactionClient,
  id: string,
  input: UpdateProjectInput,
  options: UpdateProjectOptions,
): Promise<ProjectUpdateResult> {
  const existingRecord = await tx.project.findUnique({ where: { id } })

  if (!existingRecord) {
    throw new NotFoundError('El proyecto solicitado no existe.')
  }

  const existing = toProject(existingRecord)
  const now = options.now ?? new Date().toISOString()
  const updated: Project = { ...existing, ...input, updatedAt: now }

  validateMergedProject(updated)

  const drafts = diffProject(existing, updated)

  if (drafts.length === 0) {
    return {
      project: existing,
      changed: false,
      version: null,
      changes: [],
      alerts: [],
    }
  }

  const aggregate = await tx.projectVersion.aggregate({
    where: { projectId: id },
    _max: { versionNumber: true },
  })
  const versionNumber = (aggregate._max.versionNumber ?? 0) + 1

  const versionId = randomUUID()
  const reason = options.reason?.trim() ? options.reason.trim() : null

  const version: ProjectVersion = {
    id: versionId,
    projectId: id,
    versionNumber,
    snapshot: updated,
    changedAt: now,
    changedBy: options.actorId,
    source: options.source,
    reason,
  }

  const changes: ChangeEvent[] = drafts.map((draft) => ({
    id: randomUUID(),
    versionId,
    projectId: id,
    field: draft.field,
    oldValue: draft.oldValue,
    newValue: draft.newValue,
    changeType: draft.field,
  }))

  const storedRules = await tx.ruleConfig.findMany()
  const ruleConfigs =
    storedRules.length > 0
      ? storedRules.map(toRuleConfig)
      : DEFAULT_RULE_CONFIGS

  const alertDrafts = evaluateChangeRules({
    previous: existing,
    next: updated,
    ruleConfigs,
    referenceDate: DEMO_REFERENCE_DATE,
    includeTimeRules: true,
  })

  const alerts: Alert[] = alertDrafts.map((draft) => ({
    id: randomUUID(),
    projectId: id,
    versionId,
    ruleId: draft.ruleKey,
    severity: draft.severity,
    status: 'open',
    title: draft.title,
    description: draft.description,
    createdAt: now,
    reviewedAt: null,
    resolvedAt: null,
  }))

  await tx.project.update({
    where: { id },
    data: {
      name: updated.name,
      description: updated.description,
      sector: updated.sector,
      client: updated.client,
      ownerId: updated.ownerId,
      status: updated.status,
      priority: updated.priority,
      initialBudgetCents: updated.initialBudgetCents,
      currentBudgetCents: updated.currentBudgetCents,
      currency: updated.currency,
      progress: updated.progress,
      startDate: parseDate(updated.startDate),
      dueDate: parseDate(updated.dueDate),
      completedAt: updated.completedAt ? parseDate(updated.completedAt) : null,
      tags: JSON.stringify(updated.tags),
      updatedAt: new Date(now),
      archivedAt: updated.archivedAt ? new Date(updated.archivedAt) : null,
    },
  })

  await tx.projectVersion.create({
    data: {
      id: versionId,
      projectId: id,
      versionNumber,
      snapshot: JSON.stringify(updated),
      changedAt: new Date(now),
      changedBy: options.actorId,
      source: options.source,
      reason,
    },
  })

  await tx.changeEvent.createMany({
    data: changes.map((change) => ({
      id: change.id,
      versionId: change.versionId,
      projectId: change.projectId,
      field: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      changeType: change.changeType,
    })),
  })

  if (alerts.length > 0) {
    await tx.alert.createMany({
      data: alerts.map((alert) => ({
        id: alert.id,
        projectId: alert.projectId,
        versionId: alert.versionId ?? null,
        ruleId: alert.ruleId,
        severity: alert.severity,
        status: alert.status,
        title: alert.title,
        description: alert.description,
        createdAt: new Date(alert.createdAt),
        reviewedAt: null,
        resolvedAt: null,
      })),
    })
  }

  const activity = [
    {
      id: randomUUID(),
      projectId: id,
      actorId: options.actorId,
      action: 'version.created',
      source: options.source,
      createdAt: new Date(now),
      metadata: JSON.stringify({
        versionNumber: String(versionNumber),
        fields: String(changes.length),
        reason: reason ?? '',
      }),
    },
    ...alerts.map((alert) => ({
      id: randomUUID(),
      projectId: id,
      actorId: null,
      action: 'alert.generated',
      source: 'system',
      createdAt: new Date(alert.createdAt),
      metadata: JSON.stringify({
        ruleId: alert.ruleId,
        severity: alert.severity,
        versionId,
      }),
    })),
  ]

  await tx.activityLog.createMany({ data: activity })

  return { project: updated, changed: true, version, changes, alerts }
}
