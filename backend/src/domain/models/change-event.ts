export const CHANGE_TYPES = [
  'budget',
  'deadline',
  'status',
  'progress',
  'priority',
  'owner',
] as const

export type ChangeType = (typeof CHANGE_TYPES)[number]

export interface ChangeEvent {
  id: string
  versionId: string
  projectId: string
  field: ChangeType
  oldValue: string
  newValue: string
  changeType: ChangeType
}
