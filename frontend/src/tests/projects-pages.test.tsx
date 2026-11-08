import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Providers } from '@/app/providers'
import { generateDemoDataset } from '@/data/mock/seed/seed'
import { ProjectDetailPage } from '@/features/projects/project-detail-page'
import { ProjectsPage } from '@/features/projects/projects-page'

function renderRoute(path: string, pattern: string, element: ReactNode) {
  return render(
    <Providers>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={pattern} element={element} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

describe('ProjectsPage', () => {
  it('renders the portfolio with the full project count', async () => {
    const dataset = generateDemoDataset()
    renderRoute('/projects', '/projects', <ProjectsPage />)

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Proyectos', level: 1 },
        { timeout: 8000 },
      ),
    ).toBeInTheDocument()

    expect(
      await screen.findByText(`${dataset.projects.length} proyectos`),
    ).toBeInTheDocument()
  })

  it('applies status filters from the URL', async () => {
    const dataset = generateDemoDataset()
    const completed = dataset.projects.filter(
      (project) => project.status === 'completed',
    ).length

    renderRoute('/projects?estado=completed', '/projects', <ProjectsPage />)

    expect(
      await screen.findByText(`${completed} proyectos`, {}, { timeout: 8000 }),
    ).toBeInTheDocument()
  })

  it('shows the archived view when the URL asks for it', async () => {
    renderRoute('/projects?archivados=solo', '/projects', <ProjectsPage />)

    expect(
      await screen.findByRole(
        'heading',
        { name: 'Proyectos archivados', level: 1 },
        { timeout: 8000 },
      ),
    ).toBeInTheDocument()
    expect(
      await screen.findByText('Todavía no hay proyectos archivados'),
    ).toBeInTheDocument()
  })
})

describe('ProjectDetailPage', () => {
  it('renders the selected project summary', async () => {
    const dataset = generateDemoDataset()
    const project = dataset.projects.find((item) => item.id === 'prj_0001')

    renderRoute('/projects/prj_0001', '/projects/:id', <ProjectDetailPage />)

    expect(
      await screen.findByRole(
        'heading',
        { name: project?.name ?? '', level: 1 },
        { timeout: 8000 },
      ),
    ).toBeInTheDocument()
    expect(await screen.findByText('Alertas del proyecto')).toBeInTheDocument()
  })
})
