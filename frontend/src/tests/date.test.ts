import { describe, expect, it } from 'vitest'
import {
  daysBetween,
  formatDate,
  formatRelative,
  isPastDate,
  monthKey,
  parseDate,
} from '@/domain/utils/date'

describe('date utils', () => {
  it('formats ISO dates in Spanish short form', () => {
    expect(formatDate('2026-10-31')).toBe('31 oct 2026')
  })

  it('measures the distance between two dates in days', () => {
    expect(daysBetween('2026-10-01', '2026-10-31')).toBe(30)
  })

  it('detects dates in the past relative to the demo reference', () => {
    expect(isPastDate('2026-10-01', '2026-10-31')).toBe(true)
    expect(isPastDate('2026-12-01', '2026-10-31')).toBe(false)
  })

  it('builds stable month keys', () => {
    expect(monthKey(parseDate('2026-03-14'))).toBe('2026-03')
  })

  it('describes relative time in Spanish', () => {
    expect(
      formatRelative('2026-10-31T08:00:00.000Z', '2026-10-31T12:00:00.000Z'),
    ).toBe('hace 4 h')
    expect(
      formatRelative('2026-10-30T12:00:00.000Z', '2026-10-31T12:00:00.000Z'),
    ).toBe('ayer')
  })
})
