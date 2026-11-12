import { expect, test } from '@playwright/test'

const API_BASE_URL =
  process.env.E2E_API_BASE_URL ?? 'http://localhost:4000/api/v1'

interface Project {
  id: string
  code: string
  name: string
  currentBudgetCents: number
}

interface ProjectVersion {
  versionNumber: number
  source: string
  reason: string | null
}

test.beforeAll(async ({ request }) => {
  const response = await request.post(`${API_BASE_URL}/demo/reset`)
  expect(response.ok()).toBe(true)
})

test.afterAll(async ({ request }) => {
  await request.post(`${API_BASE_URL}/demo/reset`)
})

test('editar un proyecto contra la API real crea una versión manual', async ({
  page,
  request,
}) => {
  const listed = await request.get(
    `${API_BASE_URL}/projects?search=PRJ-001&pageSize=1`,
  )
  expect(listed.ok()).toBe(true)
  const project = (await listed.json()).items[0] as Project
  expect(project.code).toBe('PRJ-001')

  const nextBudgetSoles = (
    Math.round(project.currentBudgetCents * 1.15) / 100
  ).toFixed(2)
  const reason = 'Integración API: ajuste de presupuesto'

  await page.goto(`/projects/${project.id}`)
  await expect(
    page.getByRole('heading', { level: 1, name: project.name }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Editar' }).click()
  await page.getByLabel(/Motivo del cambio/i).fill(reason)
  await page
    .getByRole('spinbutton', { name: /Presupuesto actual/ })
    .fill(nextBudgetSoles)
  await page.getByRole('button', { name: 'Guardar cambios' }).click()

  await expect(
    page.getByText('Proyecto actualizado. Se registró una nueva versión.'),
  ).toBeVisible()
  await expect(page).toHaveURL(new RegExp(`/projects/${project.id}$`))

  const versions = await request.get(
    `${API_BASE_URL}/versions?projectId=${project.id}&pageSize=1`,
  )
  expect(versions.ok()).toBe(true)
  const latest = (await versions.json()).items[0] as ProjectVersion

  expect(latest.versionNumber).toBeGreaterThan(1)
  expect(latest.source).toBe('manual')
  expect(latest.reason).toBe(reason)
})
