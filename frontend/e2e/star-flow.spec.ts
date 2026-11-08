import { expect, test } from '@playwright/test'
import { resetDemo } from './helpers'

test.beforeEach(async ({ page }) => {
  await resetDemo(page)
})

test('editar presupuesto crea versión, alerta y trazabilidad', async ({
  page,
}) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /Sofía|Un nuevo día, nuevas metas/,
  )

  await page.goto('/projects/prj_0001')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Implementación de ERP corporativo',
    }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Editar' }).click()
  await expect(
    page.getByRole('heading', { name: 'Editar proyecto' }),
  ).toBeVisible()

  await page
    .getByLabel(/Motivo del cambio/i)
    .fill('Ajuste de presupuesto validado en E2E')
  await page
    .getByRole('spinbutton', { name: /Presupuesto actual/ })
    .fill('5040000')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()

  await expect(
    page.getByText('Proyecto actualizado. Se registró una nueva versión.'),
  ).toBeVisible()
  await expect(page).toHaveURL(/\/projects\/prj_0001$/)

  await page.getByRole('tab', { name: 'Historial' }).click()
  await expect(page.getByText('Versión 5')).toBeVisible()
  await expect(
    page.getByText('Ajuste de presupuesto validado en E2E'),
  ).toBeVisible()
  await expect(
    page.getByText('Incremento presupuestal relevante').first(),
  ).toBeVisible()

  await page.goto('/monitor?proyecto=prj_0001&periodo=30')
  await expect(page.getByText('S/ 5,040,000').first()).toBeVisible()
  await expect(page.getByText(/v5/).first()).toBeVisible()

  await page.goto('/alerts?proyecto=prj_0001')
  await expect(
    page.getByText('Incremento presupuestal relevante').first(),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Revisar' }).first().click()
  await expect(page.getByText('Alerta marcada como revisada.')).toBeVisible()
})

test('el submenú Archivados abre la vista real', async ({ page }) => {
  await page.goto('/projects')

  await page.getByRole('link', { name: 'Archivados' }).click()

  await expect(page).toHaveURL(/archivados=solo/)
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Proyectos archivados',
    }),
  ).toBeVisible()
})

test('el reset demo restaura el portafolio inicial', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByText('50', { exact: true }).first()).toBeVisible()

  await page.goto('/projects/prj_0001')
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: 'Implementación de ERP corporativo',
    }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Editar' }).click()
  await page
    .getByRole('spinbutton', { name: /Presupuesto actual/ })
    .fill('6000000')
  await page.getByRole('button', { name: 'Guardar cambios' }).click()
  await expect(page.getByText('Se registró una nueva versión.')).toBeVisible()

  await resetDemo(page)

  await page.goto('/projects/prj_0001')
  await page.getByRole('tab', { name: 'Historial' }).click()
  await expect(page.getByText('Versión 5')).toHaveCount(0)
})
