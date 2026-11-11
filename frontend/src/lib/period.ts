import { parseDate } from '@/domain/utils/date'

export const PERIOD_DAYS = ['30', '90', '365', 'all'] as const

export type PeriodDays = (typeof PERIOD_DAYS)[number]

export function periodStart(
  period: PeriodDays,
  referenceDate: string,
): string | undefined {
  if (period === 'all') return undefined

  const reference = parseDate(referenceDate)
  return new Date(
    reference.getTime() - Number(period) * 86_400_000,
  ).toISOString()
}
