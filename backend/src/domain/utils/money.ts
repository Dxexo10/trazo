export function percentageChange(
  previous: number,
  current: number,
): number | null {
  if (previous === 0) return null
  return ((current - previous) / previous) * 100
}
