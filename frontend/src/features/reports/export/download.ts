import type { ReportDocument } from '../report-data'
import { buildReportCsv } from './csv'
import { buildReportXlsx } from './xlsx'

const CSV_MIME = 'text/csv;charset=utf-8'
const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export function downloadFile(
  data: string | Uint8Array,
  filename: string,
  mime: string,
): void {
  const part: BlobPart =
    typeof data === 'string' ? data : new Uint8Array(data).buffer
  const blob = new Blob([part], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')

  anchor.href = url
  anchor.download = filename
  anchor.style.display = 'none'
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function downloadReportCsv(document: ReportDocument): void {
  downloadFile(
    buildReportCsv(document),
    `${document.fileBaseName}.csv`,
    CSV_MIME,
  )
}

export function downloadReportXlsx(document: ReportDocument): void {
  downloadFile(
    buildReportXlsx(document),
    `${document.fileBaseName}.xlsx`,
    XLSX_MIME,
  )
}
