import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { Providers } from '@/app/providers'
import { Sidebar } from '@/app/layouts/sidebar'
import { THEME_STORAGE_KEY } from '@/lib/theme'

function renderSidebar(collapsed: boolean) {
  return render(
    <Providers>
      <MemoryRouter initialEntries={['/dashboard']}>
        <Sidebar collapsed={collapsed} onToggle={() => {}} />
      </MemoryRouter>
    </Providers>,
  )
}

describe('AppearanceControl', () => {
  beforeEach(() => {
    window.localStorage.clear()
    document.documentElement.classList.remove('dark')
  })

  it('exposes the three themes in expanded mode', async () => {
    const user = userEvent.setup()
    renderSidebar(false)

    expect(screen.getByText('Apariencia')).toBeInTheDocument()

    const system = screen.getByRole('button', { name: 'Sistema' })
    expect(system).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Oscuro' }))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(screen.getByRole('button', { name: 'Oscuro' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('uses a labeled menu in compact mode', async () => {
    const user = userEvent.setup()
    renderSidebar(true)

    const trigger = screen.getByRole('button', {
      name: 'Apariencia: Sistema',
    })
    await user.click(trigger)

    await user.click(screen.getByRole('menuitemradio', { name: 'Oscuro' }))

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark')
    expect(
      screen.getByRole('button', { name: 'Apariencia: Oscuro' }),
    ).toBeInTheDocument()
  })
})
