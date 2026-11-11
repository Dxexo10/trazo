export const ACTIVITY_SOURCES = ['simulated', 'manual', 'system'] as const

export type ActivitySource = (typeof ACTIVITY_SOURCES)[number]

export interface ActivityLog {
  id: string
  projectId: string | null
  actorId: string | null
  action: string
  source: ActivitySource
  createdAt: string
  metadata: Record<string, string>
}
