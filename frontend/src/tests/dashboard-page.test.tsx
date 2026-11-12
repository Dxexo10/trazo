import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Providers } from '@/app/providers'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import {
  buildDashboardGreeting,
  getTimeBand,
  pickDashboardGreetingIndex,
  readOrCreateGreetingSeed,
} from '@/lib/greeting'

const SLOW_TEST_TIMEOUT_MS = 30_000

function dashboardGreeting() {
  const band = getTimeBand(new Date().getHours())
  const seed = readOrCreateGreetingSeed()

  return buildDashboardGreeting(
    band,
    'Sofía',
    pickDashboardGreetingIndex(band, seed),
  )
}

function renderDashboard() {
  return render(
    <Providers>
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    </Providers>,
  )
}

function totalProjectsCard(): HTMLElement {
  const card = screen
    .getByText('Total de proyectos')
    .closest('[data-slot="card"]')

  if (!(card instanceof HTMLElement)) {
    throw new Error('No se encontró la tarjeta del total de proyectos.')
  }

  return card
}

describe('DashboardPage', () => {
  it('renders the executive summary using the mock repository', async () => {
    const expectedGreeting = dashboardGreeting()
    renderDashboard()

    expect(
      await screen.findByRole(
        'heading',
        { name: expectedGreeting, level: 1 },
        { timeout: 8000 },
      ),
    ).toBeInTheDocument()

    expect(await screen.findByText('Total de proyectos')).toBeInTheDocument()
    expect(
      await screen.findByText('Proyectos que requieren atención'),
    ).toBeInTheDocument()
    expect(await screen.findByText('Actividad reciente')).toBeInTheDocument()

    expect(within(totalProjectsCard()).getByText('50')).toBeInTheDocument()
  })

  it(
    'keeps the full portfolio total when a shorter period is selected',
    async () => {
      const user = userEvent.setup()
      renderDashboard()

      await screen.findByText('Total de proyectos', undefined, {
        timeout: 8000,
      })
      expect(within(totalProjectsCard()).getByText('50')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: '3 meses' }))

      expect(within(totalProjectsCard()).getByText('50')).toBeInTheDocument()
    },
    SLOW_TEST_TIMEOUT_MS,
  )
})
