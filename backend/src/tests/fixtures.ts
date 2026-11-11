import type {
  Alert,
  ChangeEvent,
  Project,
  ProjectVersion,
} from '../domain/models/index.js'

export function createProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'prj_test_0001',
    code: 'PRJ-001',
    name: 'Implementación de ERP corporativo',
    description: 'Proyecto de prueba.',
    sector: 'technology',
    client: 'Grupo Andino',
    ownerId: 'usr_0001',
    status: 'in_progress',
    priority: 'medium',
    initialBudgetCents: 240_000_000,
    currentBudgetCents: 288_000_000,
    currency: 'PEN',
    progress: 55,
    startDate: '2026-01-15',
    dueDate: '2026-09-30',
    completedAt: null,
    tags: ['ERP'],
    createdAt: '2026-01-10T09:00:00.000Z',
    updatedAt: '2026-10-20T09:00:00.000Z',
    archivedAt: null,
    ...overrides,
  }
}

export function createVersion(
  overrides: Partial<ProjectVersion> = {},
): ProjectVersion {
  const snapshot = overrides.snapshot ?? createProject()

  return {
    id: 'ver_test_0001',
    projectId: snapshot.id,
    versionNumber: 1,
    snapshot,
    changedAt: '2026-10-20T09:00:00.000Z',
    changedBy: 'usr_0001',
    source: 'manual',
    reason: null,
    ...overrides,
  }
}

export function createChangeEvent(
  overrides: Partial<ChangeEvent> = {},
): ChangeEvent {
  const field = overrides.field ?? 'budget'

  return {
    id: 'chg_test_0001',
    versionId: 'ver_test_0001',
    projectId: 'prj_test_0001',
    field,
    oldValue: '240000000',
    newValue: '288000000',
    changeType: field,
    ...overrides,
  }
}

export function createAlert(overrides: Partial<Alert> = {}): Alert {
  return {
    id: 'alt_test_0001',
    projectId: 'prj_test_0001',
    versionId: 'ver_test_0001',
    ruleId: 'budget-increase-warning',
    severity: 'warning',
    status: 'open',
    title: 'Incremento presupuestal relevante',
    description:
      'El presupuesto actual aumentó un 12,0 % respecto a la versión anterior.',
    createdAt: '2026-10-20T09:00:00.000Z',
    reviewedAt: null,
    resolvedAt: null,
    ...overrides,
  }
}
