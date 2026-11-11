import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { DEMO_USERS } from '@/data/mock/seed/users'
import { formatCurrency } from '@/domain/utils/money'
import { buildReportCsv } from '@/features/reports/export/csv'
import { buildReportXlsx } from '@/features/reports/export/xlsx'
import {
  buildAlertsReport,
  buildProjectsReport,
  formatReportCell,
  type ReportColumn,
} from '@/features/reports/report-data'
import {
  parseReportFilters,
  serialiseReportFilters,
} from '@/features/reports/hooks/use-report-filters'
import { DEMO_LABEL, DEMO_REFERENCE_DATE } from '@/lib/demo-config'
import { createAlert, createProject } from './fixtures'

const GENERATED_AT = '2026-11-11T10:00:00.000Z'

const projects = [
  createProject({ code: 'PRJ-002', name: 'Migración cloud', progress: 40 }),
  createProject({
    code: 'PRJ-001',
    name: 'ERP, "fase 2"',
    client: 'Grupo Andino',
    currentBudgetCents: 288_000_000,
  }),
]

const alerts = [
  createAlert({ id: 'alt_1', status: 'open', severity: 'critical' }),
  createAlert({
    id: 'alt_2',
    status: 'resolved',
    severity: 'warning',
    createdAt: '2026-10-01T09:00:00.000Z',
  }),
]

describe('report documents', () => {
  it('formats cells according to their column kind', () => {
    const currency: ReportColumn = {
      key: 'budget',
      label: 'Presupuesto',
      kind: 'currency',
    }
    const percent: ReportColumn = {
      key: 'variation',
      label: 'Variación',
      kind: 'percent',
    }
    const date: ReportColumn = {
      key: 'dueDate',
      label: 'Entrega',
      kind: 'date',
    }

    expect(formatReportCell(currency, 240_000_000)).toBe(
      formatCurrency(240_000_000),
    )
    expect(formatReportCell(percent, 12.5)).toContain('12,5')
    expect(formatReportCell(date, '2026-10-31')).toBe('31 oct 2026')
    expect(formatReportCell(currency, null)).toBe('—')
  })

  it('builds a project report with metadata and sorted rows', () => {
    const document = buildProjectsReport({
      projects,
      users: DEMO_USERS,
      filters: ['Estado: En ejecución'],
      referenceDate: DEMO_REFERENCE_DATE,
      generatedAt: GENERATED_AT,
    })

    expect(document.sheetName).toBe('Proyectos')
    expect(document.fileBaseName).toBe('trazo-proyectos-2026-10-31')
    expect(document.metadata.datasetLabel).toBe(DEMO_LABEL)
    expect(document.metadata.lines).toContain('Filtros: Estado: En ejecución')
    expect(document.rows.map((row) => row.code)).toEqual(['PRJ-001', 'PRJ-002'])
    expect(document.metrics).toContainEqual({ label: 'Proyectos', value: '2' })
    expect(document.rows[0]?.owner).toBe('Sofía Herrera')
  })

  it('builds an alert report with rule labels and metrics', () => {
    const projectById = new Map(
      projects.map((project) => [project.id, project]),
    )
    const document = buildAlertsReport({
      alerts,
      projectById,
      filters: ['Periodo: Todo el historial'],
      referenceDate: DEMO_REFERENCE_DATE,
      generatedAt: GENERATED_AT,
    })

    expect(document.sheetName).toBe('Alertas')
    expect(document.rows).toHaveLength(2)
    expect(document.rows[0]?.status).toBe('Abierta')
    expect(document.rows[0]?.rule).toBe('Incremento presupuestal relevante')
    expect(document.rows[0]?.project).toContain('PRJ-001')
    expect(document.metrics).toContainEqual({ label: 'Abiertas', value: '1' })
  })
})

describe('report exports', () => {
  it('serialises CSV with BOM, escaped cells and demo metadata', () => {
    const document = buildProjectsReport({
      projects,
      users: DEMO_USERS,
      filters: [],
      referenceDate: DEMO_REFERENCE_DATE,
      generatedAt: GENERATED_AT,
    })
    const csv = buildReportCsv(document)

    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain(DEMO_LABEL)
    expect(csv).toContain('Código,Proyecto,Cliente')
    expect(csv).toContain('"ERP, ""fase 2"""')
    expect(csv).toContain('Resumen')
    expect(csv.endsWith('\r\n')).toBe(true)
  })

  it('generates a valid XLSX package with typed cells', () => {
    const document = buildProjectsReport({
      projects,
      users: DEMO_USERS,
      filters: [],
      referenceDate: DEMO_REFERENCE_DATE,
      generatedAt: GENERATED_AT,
    })
    const zip = unzipSync(buildReportXlsx(document))
    const sheet = strFromU8(zip['xl/worksheets/sheet1.xml'] ?? new Uint8Array())

    expect(Object.keys(zip)).toEqual(
      expect.arrayContaining([
        '[Content_Types].xml',
        'xl/workbook.xml',
        'xl/worksheets/sheet1.xml',
      ]),
    )
    expect(sheet).toContain(DEMO_LABEL)
    expect(sheet).toContain('ERP, &quot;fase 2&quot;')
    expect(sheet).toContain('<v>2400000</v>')
    expect(sheet).toContain('<v>2880000</v>')
  })
})

describe('report filters', () => {
  it('round-trips filters through the URL', () => {
    const params = new URLSearchParams(
      'vista=alertas&a_estado=open&a_severidad=critical&a_periodo=30&a_proyecto=prj_1',
    )
    const filters = parseReportFilters(params)

    expect(filters.tab).toBe('alertas')
    expect(filters.alertStatus).toBe('open')
    expect(filters.alertSeverity).toBe('critical')
    expect(filters.alertPeriod).toBe('30')
    expect(filters.alertProjectId).toBe('prj_1')

    const serialised = serialiseReportFilters(filters)
    expect(serialised.get('vista')).toBe('alertas')
    expect(serialised.get('a_estado')).toBe('open')
    expect(serialised.get('a_periodo')).toBe('30')
  })

  it('falls back to safe defaults for unknown values', () => {
    const filters = parseReportFilters(
      new URLSearchParams('vista=otra&estado=inventado&a_periodo=999'),
    )

    expect(filters.tab).toBe('proyectos')
    expect(filters.projectStatus).toBe('all')
    expect(filters.alertPeriod).toBe('all')
  })

  it('serialises only the active tab defaults once cleared', () => {
    const params = new URLSearchParams(
      'vista=proyectos&estado=on_hold&q=erp&a_estado=open',
    )
    const filters = parseReportFilters(params)

    expect(filters.projectStatus).toBe('on_hold')
    expect(filters.search).toBe('erp')
    expect(serialiseReportFilters(filters).get('a_estado')).toBe('open')
  })
})
