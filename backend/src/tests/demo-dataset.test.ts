import { describe, expect, it } from 'vitest'
import { generateDemoDataset } from '../domain/seed/dataset.js'
import { buildDashboardSummary } from '../domain/services/dashboard-summary.js'
import { DEMO_REFERENCE_DATE } from '../lib/demo-config.js'

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/

describe('dataset demo del backend', () => {
  it('es determinista para la semilla documentada', () => {
    const first = generateDemoDataset()
    const second = generateDemoDataset()

    expect(first.projects).toEqual(second.projects)
    expect(first.versions).toEqual(second.versions)
    expect(first.changes).toEqual(second.changes)
    expect(first.alerts).toEqual(second.alerts)
    expect(first.activity).toEqual(second.activity)
  })

  it('genera un portafolio coherente de 50 proyectos', () => {
    const { projects } = generateDemoDataset()

    expect(projects).toHaveLength(50)
    expect(new Set(projects.map((project) => project.id)).size).toBe(50)
    expect(new Set(projects.map((project) => project.code)).size).toBe(50)

    for (const project of projects) {
      expect(project.id).toMatch(UUID_PATTERN)
      expect(project.progress).toBeGreaterThanOrEqual(0)
      expect(project.progress).toBeLessThanOrEqual(100)
      expect(project.initialBudgetCents).toBeGreaterThanOrEqual(0)
      expect(project.currentBudgetCents).toBeGreaterThanOrEqual(0)
      expect(project.dueDate >= project.startDate).toBe(true)

      if (project.status === 'completed') {
        expect(project.progress).toBe(100)
        expect(project.completedAt).not.toBeNull()
      }
    }
  })

  it('siembra versiones inmutables y cambios coherentes', () => {
    const { projects, versions, changes } = generateDemoDataset()
    const projectIds = new Set(projects.map((project) => project.id))
    const versionIds = new Set(versions.map((version) => version.id))

    expect(versions.length).toBeGreaterThan(projects.length)
    expect(new Set(versions.map((version) => version.id)).size).toBe(
      versions.length,
    )
    expect(versions.every((version) => projectIds.has(version.projectId))).toBe(
      true,
    )
    expect(new Set(changes.map((change) => change.id)).size).toBe(
      changes.length,
    )
    expect(
      changes.every(
        (change) =>
          versionIds.has(change.versionId) &&
          change.oldValue !== change.newValue,
      ),
    ).toBe(true)

    for (const project of projects) {
      const projectVersions = versions
        .filter((version) => version.projectId === project.id)
        .sort((a, b) => a.versionNumber - b.versionNumber)

      expect(projectVersions.length).toBeGreaterThanOrEqual(2)
      expect(projectVersions[0]?.versionNumber).toBe(1)
      expect(projectVersions.at(-1)?.snapshot).toEqual(project)
    }
  })

  it('deriva alertas de las versiones y las reglas', () => {
    const { projects, versions, alerts, rules, activity } =
      generateDemoDataset()
    const versionIds = new Set(versions.map((version) => version.id))
    const dedupeKeys = alerts.map(
      (alert) => `${alert.projectId}:${alert.versionId}:${alert.ruleId}`,
    )

    expect(rules).toHaveLength(7)
    expect(alerts.length).toBeGreaterThan(10)
    expect(activity.length).toBeGreaterThan(projects.length)
    expect(
      alerts.every(
        (alert) =>
          projects.some((project) => project.id === alert.projectId) &&
          alert.versionId !== undefined &&
          versionIds.has(alert.versionId),
      ),
    ).toBe(true)
    expect(new Set(dedupeKeys).size).toBe(dedupeKeys.length)
  })

  it('mantiene las fechas dentro de la fecha de referencia', () => {
    const { projects, versions, alerts, activity } = generateDemoDataset()
    const reference = `${DEMO_REFERENCE_DATE}T23:59:59.999Z`

    expect(projects.every((project) => project.updatedAt <= reference)).toBe(
      true,
    )
    expect(versions.every((version) => version.changedAt <= reference)).toBe(
      true,
    )
    expect(alerts.every((alert) => alert.createdAt <= reference)).toBe(true)
    expect(activity.every((entry) => entry.createdAt <= reference)).toBe(true)
  })

  it('reporta el portafolio completo en todos los periodos', () => {
    const { projects, alerts } = generateDemoDataset()

    for (const periodMonths of [3, 6, 12] as const) {
      const summary = buildDashboardSummary({
        projects,
        alerts,
        filters: { periodMonths },
        referenceDate: DEMO_REFERENCE_DATE,
      })

      expect(summary.periodMonths).toBe(periodMonths)
      expect(summary.totals.projects).toBe(projects.length)
      expect(summary.totals.completed).toBeGreaterThan(0)
      expect(summary.totals.openAlerts).toBeGreaterThan(0)
      expect(
        summary.statusDistribution.reduce(
          (total, slice) => total + slice.count,
          0,
        ),
      ).toBe(projects.length)
    }
  })
})
