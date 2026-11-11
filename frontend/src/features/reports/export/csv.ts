import type { ReportDocument } from '../report-data'
import { formatReportCell } from '../report-data'

function escapeCsvCell(value: string): string {
  if (/[",\r\n]/.test(value) || /^\s|\s$/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function buildReportCsv(document: ReportDocument): string {
  const lines: string[][] = [
    [document.metadata.title],
    [document.metadata.datasetLabel],
    ...document.metadata.lines.map((line) => [line]),
    [],
    document.columns.map((column) => column.label),
    ...document.rows.map((row) =>
      document.columns.map((column) =>
        formatReportCell(column, row[column.key]),
      ),
    ),
  ]

  if (document.metrics.length > 0) {
    lines.push(
      [],
      ['Resumen'],
      ...document.metrics.map((metric) => [metric.label, metric.value]),
    )
  }

  const body = lines
    .map((line) => line.map(escapeCsvCell).join(','))
    .join('\r\n')

  return `\uFEFF${body}\r\n`
}
