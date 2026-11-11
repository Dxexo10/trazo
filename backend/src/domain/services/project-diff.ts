import type { ChangeType, Project } from '../models/index.js'

export interface ChangeDraft {
  field: ChangeType
  oldValue: string
  newValue: string
}

const TRACKED_FIELDS: {
  field: ChangeType
  value: (project: Project) => string
}[] = [
  { field: 'budget', value: (project) => String(project.currentBudgetCents) },
  { field: 'deadline', value: (project) => project.dueDate },
  { field: 'status', value: (project) => project.status },
  { field: 'progress', value: (project) => String(project.progress) },
  { field: 'priority', value: (project) => project.priority },
  { field: 'owner', value: (project) => project.ownerId },
]

export function diffProject(previous: Project, next: Project): ChangeDraft[] {
  const changes: ChangeDraft[] = []

  for (const { field, value } of TRACKED_FIELDS) {
    const oldValue = value(previous)
    const newValue = value(next)

    if (oldValue !== newValue) {
      changes.push({ field, oldValue, newValue })
    }
  }

  return changes
}
