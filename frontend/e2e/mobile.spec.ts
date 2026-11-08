import { devices, expect, test } from '@playwright/test'

test.use({ ...devices['Pixel 7'] })

test('navegación y filtros móviles', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    /Sofía|Un nuevo día, nuevas metas/,
  )

  await page.getByRole('button', { name: 'Abrir navegación' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()

  await page.getByRole('link', { name: 'Proyectos' }).click()
  await expect(page).toHaveURL(/\/projects$/)

  await page.getByRole('button', { name: /^Filtros/ }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Archivados' })).toBeVisible()

  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toBeHidden()
})
