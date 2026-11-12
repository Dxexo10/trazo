import type { Project } from '@/domain/models'
import { daysBetween } from '@/domain/utils/date'
import { percentageChange } from '@/domain/utils/money'

export const ACTIVE_STATUSES = ['in_progress', 'on_hold'] as const

export function isActive(project: Project): boolean {
  return project.status === 'in_progress' || project.status === 'on_hold'
}

export function isOverdue(project: Project, referenceDate: string): boolean {
  if (!isActive(project)) return false
  return daysBetween(project.dueDate, referenceDate) > 0
}

export function overdueDays(project: Project, referenceDate: string): number {
  return Math.max(0, daysBetween(project.dueDate, referenceDate))
}

export function budgetVariation(project: Project): number | null {
  return percentageChange(
    project.initialBudgetCents,
    project.currentBudgetCents,
  )
}

export type RiskLevel = 'low' | 'medium' | 'high'

export interface ProjectRisk {
  score: number
  level: RiskLevel
  reasons: string[]
}

export function assessProjectRisk(
  project: Project,
  referenceDate: string,
): ProjectRisk {
  const reasons: string[] = []
  let score = 0

  const overdue = overdueDays(project, referenceDate)
  if (overdue > 0) {
    score += 40
    reasons.push(`Entrega vencida hace ${overdue} días`)
  }

  if (project.status === 'on_hold') {
    score += 30
    reasons.push('Proyecto bloqueado')
  }

  if (project.priority === 'critical') {
    score += 15
    reasons.push('Prioridad crítica')
  } else if (project.priority === 'high') {
    score += 8
  }

  const variation = budgetVariation(project)
  if (variation !== null) {
    if (variation > 20) {
      score += 15
      reasons.push('Sobrecosto superior al 20 %')
    } else if (variation > 10) {
      score += 8
      reasons.push('Sobrecosto superior al 10 %')
    }
  }

  if (project.status === 'in_progress' && project.progress < 30) {
    score += 10
    reasons.push('Avance por debajo del 30 %')
  }

  const level: RiskLevel = score >= 45 ? 'high' : score >= 20 ? 'medium' : 'low'

  return { score, level, reasons }
}

export function requiresAttention(
  project: Project,
  referenceDate: string,
): boolean {
  if (project.status === 'completed' || project.status === 'cancelled') {
    return false
  }

  const risk = assessProjectRisk(project, referenceDate)
  return risk.level !== 'low'
}
