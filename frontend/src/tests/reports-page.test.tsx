import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Providers } from '@/app/providers'
import { ReportsPage } from '@/features/reports/reports-page'

function renderReports(path = '/reports') {
  return render(
    <Providers>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/reports" element={<ReportsPage />} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

describe('ReportsPage', () => {
  it('renders the project report with summary and export actions', async () => {
    renderReports()

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Reportes', level: 1 },
        { timeout: 8000 },
      ),
    ).toBeInTheDocument()

    expect(
      await screen.findByText('Reporte de proyectos', {}, { timeout: 8000 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Resumen ejecutivo')).toBeInTheDocument()
    expect(screen.getByText('Presupuesto actual')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'CSV' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'XLSX' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /Imprimir \/ Guardar PDF/ }),
    ).toBeInTheDocument()
  })

  it('switches to the alerts report from the tab list', async () => {
    const user = userEvent.setup()
    renderReports()

    await screen.findByText('Reporte de proyectos', {}, { timeout: 8000 })

    await user.click(screen.getByRole('tab', { name: 'Alertas' }))

    expect(
      await screen.findByText('Reporte de alertas', {}, { timeout: 8000 }),
    ).toBeInTheDocument()
    expect(screen.getByText('Críticas abiertas')).toBeInTheDocument()
  })

  it('reads the active tab from the URL', async () => {
    renderReports('/reports?vista=alertas&a_estado=open')

    expect(
      await screen.findByText('Reporte de alertas', {}, { timeout: 8000 }),
    ).toBeInTheDocument()

    const statusSelect = screen.getByRole('combobox', { name: 'Estado' })
    expect(statusSelect).toHaveTextContent('Abierta')
  })
})
