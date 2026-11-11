import type { Project } from './project.js'

export const VERSION_SOURCES = ['simulated', 'manual', 'system'] as const

export type VersionSource = (typeof VERSION_SOURCES)[number]

export interface ProjectVersion {
  id: string
  projectId: string
  versionNumber: number
  snapshot: Project
  changedAt: string
  changedBy: string
  source: VersionSource
  reason?: string | null
}
