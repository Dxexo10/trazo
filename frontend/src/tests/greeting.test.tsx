import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDashboardGreeting, useGreeting } from '@/hooks/use-greeting'
import {
  buildDashboardGreeting,
  DASHBOARD_GREETINGS,
  getGreeting,
  getTimeBand,
  GREETING_SEED_STORAGE_KEY,
  millisecondsUntilNextGreetingBoundary,
  pickDashboardGreetingIndex,
} from '@/lib/greeting'

const BANDS = ['morning', 'afternoon', 'evening'] as const

function GreetingProbe() {
  return <p>{useGreeting()}</p>
}

function DashboardGreetingProbe({ name }: { name: string }) {
  return <p>{useDashboardGreeting(name)}</p>
}

function expectedDashboardGreeting(band: (typeof BANDS)[number], seed: number) {
  return buildDashboardGreeting(
    band,
    'Sofía',
    pickDashboardGreetingIndex(band, seed),
  )
}

describe('getGreeting', () => {
  it.each([
    [0, 'Buenas noches'],
    [4, 'Buenas noches'],
    [5, 'Buenos días'],
    [11, 'Buenos días'],
    [12, 'Buenas tardes'],
    [18, 'Buenas tardes'],
    [19, 'Buenas noches'],
    [23, 'Buenas noches'],
  ])('maps hour %i to %s', (hour, expected) => {
    expect(getGreeting(hour)).toBe(expected)
  })
})

describe('getTimeBand', () => {
  it.each([
    [0, 'evening'],
    [4, 'evening'],
    [5, 'morning'],
    [11, 'morning'],
    [12, 'afternoon'],
    [18, 'afternoon'],
    [19, 'evening'],
    [23, 'evening'],
  ] as const)('maps hour %i to %s', (hour, expected) => {
    expect(getTimeBand(hour)).toBe(expected)
  })
})

describe('dashboard greetings', () => {
  it('defines exactly three alternatives per time band', () => {
    for (const band of BANDS) {
      expect(DASHBOARD_GREETINGS[band]).toHaveLength(3)
      expect(new Set(DASHBOARD_GREETINGS[band]).size).toBe(3)
    }
  })

  it('interpolates the profile name in every variant', () => {
    for (const band of BANDS) {
      DASHBOARD_GREETINGS[band].forEach((template, index) => {
        const message = buildDashboardGreeting(band, 'Sofía', index)

        expect(message).toBe(template.replaceAll('{nombre}', 'Sofía'))
        expect(message).not.toContain('{nombre}')
      })
    }
  })

  it('keeps the pseudo-random selection stable for the same seed and band', () => {
    for (const band of BANDS) {
      const first = pickDashboardGreetingIndex(band, 42)
      const second = pickDashboardGreetingIndex(band, 42)

      expect(first).toBe(second)
      expect(first).toBeGreaterThanOrEqual(0)
      expect(first).toBeLessThan(3)
    }
  })
})

describe('millisecondsUntilNextGreetingBoundary', () => {
  it.each([
    [new Date(2026, 0, 1, 4, 59, 0), 60_000],
    [new Date(2026, 0, 1, 11, 59, 0), 60_000],
    [new Date(2026, 0, 1, 18, 59, 0), 60_000],
    [new Date(2026, 0, 1, 23, 59, 0), 5 * 60 * 60 * 1000 + 60_000],
  ])('schedules the next boundary from %s', (now, expected) => {
    expect(millisecondsUntilNextGreetingBoundary(now)).toBe(expected)
  })
})

describe('useGreeting', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 11, 59, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates automatically when the time band changes', () => {
    render(<GreetingProbe />)

    expect(screen.getByText('Buenos días')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(60_000)
    })

    expect(screen.getByText('Buenas tardes')).toBeInTheDocument()
  })
})

describe('useDashboardGreeting', () => {
  beforeEach(() => {
    window.sessionStorage.clear()
    window.sessionStorage.setItem(GREETING_SEED_STORAGE_KEY, '42')
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 1, 11, 59, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates automatically when the time band changes', () => {
    render(<DashboardGreetingProbe name="Sofía" />)

    expect(
      screen.getByText(expectedDashboardGreeting('morning', 42)),
    ).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(60_000)
    })

    expect(
      screen.getByText(expectedDashboardGreeting('afternoon', 42)),
    ).toBeInTheDocument()
  })

  it('keeps the same message across re-renders and remounts', () => {
    const expected = expectedDashboardGreeting('morning', 42)
    const { rerender, unmount } = render(
      <DashboardGreetingProbe name="Sofía" />,
    )

    expect(screen.getByText(expected)).toBeInTheDocument()

    rerender(<DashboardGreetingProbe name="Sofía" />)
    expect(screen.getByText(expected)).toBeInTheDocument()

    unmount()
    render(<DashboardGreetingProbe name="Sofía" />)
    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
