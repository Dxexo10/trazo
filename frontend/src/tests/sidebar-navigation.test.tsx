import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '@/app/providers'
import { MobileNav } from '@/app/layouts/mobile-nav'
import { Sidebar } from '@/app/layouts/sidebar'

function renderSidebar({
  collapsed = false,
  initialEntry = '/projects',
}: {
  collapsed?: boolean
  initialEntry?: string
} = {}) {
  return render(
    <Providers>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Sidebar collapsed={collapsed} onToggle={() => {}} />
      </MemoryRouter>
    </Providers>,
  )
}

describe('Sidebar navigation', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('groups the projects module and opens the active branch', () => {
    renderSidebar({ initialEntry: '/projects?estado=in_progress' })

    expect(
      screen.getByRole('button', { name: 'Contraer Proyectos' }),
    ).toHaveAttribute('aria-expanded', 'true')

    const running = screen.getByRole('link', { name: 'En ejecución' })
    expect(running).toHaveAttribute('aria-current', 'page')
    expect(
      screen.getByRole('link', { name: 'Todos los proyectos' }),
    ).not.toHaveAttribute('aria-current')

    expect(screen.getByRole('link', { name: 'Archivados' })).toHaveAttribute(
      'href',
      '/projects?archivados=solo',
    )
  })

  it('collapses and expands a group on demand', async () => {
    const user = userEvent.setup()
    renderSidebar()

    expect(
      screen.getByRole('link', { name: 'Todos los proyectos' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Contraer Proyectos' }))

    expect(
      screen.queryByRole('link', { name: 'Todos los proyectos' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Expandir Proyectos' }))

    expect(
      screen.getByRole('link', { name: 'Todos los proyectos' }),
    ).toBeInTheDocument()
  })

  it('opens a lateral popover for groups in compact mode', async () => {
    const user = userEvent.setup()
    renderSidebar({ collapsed: true })

    expect(
      screen.queryByRole('link', { name: 'En ejecución' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Proyectos' }))

    expect(
      await screen.findByRole('link', { name: 'En ejecución' }),
    ).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(
        screen.queryByRole('link', { name: 'En ejecución' }),
      ).not.toBeInTheDocument()
    })
  })

  it('marks alert filters as the active submodule', () => {
    renderSidebar({ initialEntry: '/alerts?estado=reviewed' })

    const reviewed = screen.getByRole('link', { name: 'Alertas revisadas' })
    expect(reviewed).toHaveAttribute('aria-current', 'page')

    const opened = screen.getByRole('link', { name: 'Alertas abiertas' })
    expect(opened).not.toHaveAttribute('aria-current')
  })

  it('keeps settings in the anchored section', () => {
    renderSidebar()

    const settings = screen.getByRole('link', {
      name: 'Configuración demo',
    })
    expect(settings).toBeInTheDocument()
  })

  it('opens and closes the mobile drawer with Escape', async () => {
    const user = userEvent.setup()
    render(
      <Providers>
        <MemoryRouter initialEntries={['/dashboard']}>
          <MobileNav />
        </MemoryRouter>
      </Providers>,
    )

    await user.click(screen.getByRole('button', { name: 'Abrir navegación' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByRole('link', { name: 'Proyectos' }),
    ).toBeInTheDocument()
    expect(within(dialog).getByText('Apariencia')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('does not render product branding or demo badge in the sidebar', () => {
    renderSidebar()

    expect(screen.queryByText('trazo.')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Gestión inteligente de proyectos'),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Entorno de demostración · Datos simulados'),
    ).not.toBeInTheDocument()
  })
})
