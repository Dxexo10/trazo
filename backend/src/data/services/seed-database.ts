import { generateDemoDataset } from '../../domain/seed/dataset.js'
import { parseDate } from '../../domain/utils/date.js'
import { prisma } from '../../lib/prisma.js'

export interface SeedResult {
  users: number
  projects: number
  versions: number
  changes: number
  alerts: number
  activity: number
  rules: number
}

export async function seedDatabase(): Promise<SeedResult> {
  const dataset = generateDemoDataset()

  await prisma.$transaction(
    async (tx) => {
      await tx.activityLog.deleteMany()
      await tx.alert.deleteMany()
      await tx.changeEvent.deleteMany()
      await tx.projectVersion.deleteMany()
      await tx.project.deleteMany()
      await tx.ruleConfig.deleteMany()
      await tx.demoScenario.deleteMany()
      await tx.user.deleteMany()

      await tx.user.createMany({
        data: dataset.users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatarUrl: user.avatarUrl ?? null,
        })),
      })

      await tx.ruleConfig.createMany({ data: dataset.rules })

      await tx.project.createMany({
        data: dataset.projects.map((project) => ({
          id: project.id,
          code: project.code,
          name: project.name,
          description: project.description,
          sector: project.sector,
          client: project.client,
          ownerId: project.ownerId,
          status: project.status,
          priority: project.priority,
          initialBudgetCents: project.initialBudgetCents,
          currentBudgetCents: project.currentBudgetCents,
          currency: project.currency,
          progress: project.progress,
          startDate: parseDate(project.startDate),
          dueDate: parseDate(project.dueDate),
          completedAt: project.completedAt
            ? parseDate(project.completedAt)
            : null,
          tags: JSON.stringify(project.tags),
          createdAt: new Date(project.createdAt),
          updatedAt: new Date(project.updatedAt),
          archivedAt: project.archivedAt ? new Date(project.archivedAt) : null,
        })),
      })

      await tx.projectVersion.createMany({
        data: dataset.versions.map((version) => ({
          id: version.id,
          projectId: version.projectId,
          versionNumber: version.versionNumber,
          snapshot: JSON.stringify(version.snapshot),
          changedAt: new Date(version.changedAt),
          changedBy: version.changedBy,
          source: version.source,
          reason: version.reason ?? null,
        })),
      })

      await tx.changeEvent.createMany({
        data: dataset.changes.map((change) => ({
          id: change.id,
          versionId: change.versionId,
          projectId: change.projectId,
          field: change.field,
          oldValue: change.oldValue,
          newValue: change.newValue,
          changeType: change.changeType,
        })),
      })

      await tx.alert.createMany({
        data: dataset.alerts.map((alert) => ({
          id: alert.id,
          projectId: alert.projectId,
          versionId: alert.versionId ?? null,
          ruleId: alert.ruleId,
          severity: alert.severity,
          status: alert.status,
          title: alert.title,
          description: alert.description,
          createdAt: new Date(alert.createdAt),
          reviewedAt: alert.reviewedAt ? new Date(alert.reviewedAt) : null,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt) : null,
        })),
      })

      await tx.activityLog.createMany({
        data: dataset.activity.map((entry) => ({
          id: entry.id,
          projectId: entry.projectId,
          actorId: entry.actorId,
          action: entry.action,
          source: entry.source,
          createdAt: new Date(entry.createdAt),
          metadata: JSON.stringify(entry.metadata),
        })),
      })
    },
    { timeout: 120_000 },
  )

  return {
    users: dataset.users.length,
    projects: dataset.projects.length,
    versions: dataset.versions.length,
    changes: dataset.changes.length,
    alerts: dataset.alerts.length,
    activity: dataset.activity.length,
    rules: dataset.rules.length,
  }
}
