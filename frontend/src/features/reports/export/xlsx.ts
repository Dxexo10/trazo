import { strToU8, zipSync } from 'fflate'
import { formatDate } from '@/domain/utils/date'
import type { ReportColumn, ReportDocument } from '../report-data'

type XlsxValue = string | number | null
type XlsxRow = XlsxValue[]

function stripInvalidXmlChars(value: string): string {
  let result = ''

  for (const char of value) {
    const code = char.codePointAt(0) ?? 0
    const invalid =
      code <= 8 ||
      code === 11 ||
      code === 12 ||
      (code >= 14 && code <= 31) ||
      code === 0xfffe ||
      code === 0xffff
    if (!invalid) result += char
  }

  return result
}

function escapeXml(value: string): string {
  return stripInvalidXmlChars(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function columnLetter(index: number): string {
  let remaining = index + 1
  let letters = ''

  while (remaining > 0) {
    const offset = (remaining - 1) % 26
    letters = String.fromCharCode(65 + offset) + letters
    remaining = Math.floor((remaining - 1) / 26)
  }

  return letters
}

function toXlsxValue(
  column: ReportColumn,
  value: string | number | null | undefined,
): XlsxValue {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'number') {
    return column.kind === 'date' ? formatDate(value) : value
  }
  if (!Number.isFinite(value)) return null
  if (column.kind === 'currency') return Number((value / 100).toFixed(2))
  if (column.kind === 'percent') return Number(value.toFixed(2))
  return value
}

function cellXml(ref: string, value: XlsxValue): string {
  if (value === null) return ''
  if (typeof value === 'number') {
    return `<c r="${ref}"><v>${value}</v></c>`
  }
  return `<c r="${ref}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
    value,
  )}</t></is></c>`
}

function rowsXml(rows: readonly XlsxRow[]): string {
  return rows
    .map((cells, rowIndex) => {
      const rowNumber = rowIndex + 1
      const content = cells
        .map((value, columnIndex) =>
          cellXml(`${columnLetter(columnIndex)}${rowNumber}`, value),
        )
        .join('')
      return `<row r="${rowNumber}">${content}</row>`
    })
    .join('')
}

function documentRows(document: ReportDocument): XlsxRow[] {
  const rows: XlsxRow[] = [
    [document.metadata.title],
    [document.metadata.datasetLabel],
    ...document.metadata.lines.map((line) => [line]),
    [],
    document.columns.map((column) => column.label),
  ]

  rows.push(
    ...document.rows.map((row) =>
      document.columns.map((column) => toXlsxValue(column, row[column.key])),
    ),
  )

  if (document.metrics.length > 0) {
    rows.push(
      [],
      ['Resumen'],
      ...document.metrics.map((metric) => [metric.label, metric.value]),
    )
  }

  return rows
}

export function buildReportXlsx(document: ReportDocument): Uint8Array {
  const worksheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml(
    documentRows(document),
  )}</sheetData></worksheet>`

  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(
    document.sheetName,
  )}" sheetId="1" r:id="rId1"/></sheets></workbook>`

  const workbookRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`

  const rootRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`

  const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`

  return zipSync(
    {
      '[Content_Types].xml': strToU8(contentTypes),
      '_rels/.rels': strToU8(rootRels),
      'xl/workbook.xml': strToU8(workbook),
      'xl/_rels/workbook.xml.rels': strToU8(workbookRels),
      'xl/worksheets/sheet1.xml': strToU8(worksheet),
    },
    { level: 6 },
  )
}
