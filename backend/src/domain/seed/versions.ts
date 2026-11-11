import type {
  ChangeEvent,
  Project,
  ProjectStatus,
  ProjectVersion,
  VersionSource,
} from '../models/index.js'
import { diffProject } from '../services/project-diff.js'
import { addDays, parseDate, toISODate } from '../utils/date.js'
import { randomInt, stableId } from './random.js'
import { DEMO_CURRENT_USER } from './users.js'

export interface GeneratedHistory {
  versions: ProjectVersion[]
  changes: ChangeEvent[]
}

const DAY_MS = 86_400_000

const MANUAL_REASONS = [
  'Ajuste solicitado por el comité de seguimiento.',
  'Reprogramación acordada con el cliente.',
  'Actualización del presupuesto tras la revisión financiera.',
  'Corrección del avance reportado por el equipo.',
] as const

function toTime(value: string): number {
  return parseDate(value).getTime()
}

function toIsoTime(time: number): string {
  return new Date(time).toISOString()
}

function baselineSnapshot(project: Project, dueDate: string): Project {
  return {
    ...project,
    status: 'planned',
    priority: 'medium',
    progress: 0,
    currentBudgetCents: project.initialBudgetCents,
    dueDate,
    completedAt: null,
    archivedAt: null,
    updatedAt: project.createdAt,
  }
}

function intermediateSnapshot(
  project: Project,
  ratio: number,
  dueDate: string,
  changedAt: string,
): Project {
  const status: ProjectStatus =
    project.status === 'planned' ? 'planned' : 'in_progress'

  return {
    ...project,
    status,
    priority: 'medium',
    progress: Math.round(project.progress * ratio),
    currentBudgetCents: Math.round(
      project.initialBudgetCents +
        (project.currentBudgetCents - project.initialBudgetCents) * ratio,
    ),
    dueDate,
    completedAt: null,
    archivedAt: null,
    updatedAt: changedAt,
  }
}

function historyDepth(index: number): number {
  if (index % 5 === 0) return 4
  if (index % 3 === 0) return 3
  return 2
}

export function generateVersions(
  random: () => number,
  projects: readonly Project[],
): GeneratedHistory {
  const versions: ProjectVersion[] = []
  const changes: ChangeEvent[] = []
  let versionCounter = 0
  let changeCounter = 0

  projects.forEach((project, index) => {
    const depth = historyDepth(index)
    const start = toTime(project.createdAt)
    const end = Math.max(toTime(project.updatedAt), start + DAY_MS)

    const delayDays = index % 4 === 0 ? randomInt(random, 10, 35) : 0
    const baselineDueDate = toISODate(
      addDays(parseDate(project.dueDate), -delayDays),
    )

    const snapshots: Project[] = [baselineSnapshot(project, baselineDueDate)]

    for (let step = 1; step < depth - 1; step += 1) {
      const ratio = step / (depth - 1)
      const changedAt = toIsoTime(Math.round(start + (end - start) * ratio))
      snapshots.push(
        intermediateSnapshot(project, ratio, baselineDueDate, changedAt),
      )
    }

    snapshots.push({ ...project })

    const localVersions: ProjectVersion[] = snapshots.map(
      (snapshot, position) => {
        const isFirst = position === 0
        const isLast = position === snapshots.length - 1
        const changedAt = isFirst
          ? project.createdAt
          : isLast
            ? project.updatedAt
            : toIsoTime(
                Math.round(start + ((end - start) * position) / (depth - 1)),
              )

        const source: VersionSource = isFirst
          ? 'system'
          : isLast && index % 6 === 0
            ? 'manual'
            : 'simulated'

        return {
          id: stableId(3, ++versionCounter),
          projectId: project.id,
          versionNumber: position + 1,
          snapshot: { ...snapshot, updatedAt: changedAt },
          changedAt,
          changedBy:
            source === 'manual' ? DEMO_CURRENT_USER.id : project.ownerId,
          source,
          reason:
            source === 'manual'
              ? (MANUAL_REASONS[index % MANUAL_REASONS.length] ?? null)
              : null,
        }
      },
    )

    for (let position = 0; position < localVersions.length; position += 1) {
      const version = localVersions[position]
      if (!version) continue

      if (position > 0) {
        const previous = localVersions[position - 1]
        if (previous) {
          for (const draft of diffProject(
            previous.snapshot,
            version.snapshot,
          )) {
            changes.push({
              id: stableId(4, ++changeCounter),
              versionId: version.id,
              projectId: project.id,
              field: draft.field,
              oldValue: draft.oldValue,
              newValue: draft.newValue,
              changeType: draft.field,
            })
          }
        }
      }

      versions.push(version)
    }
  })

  return { versions, changes }
}
