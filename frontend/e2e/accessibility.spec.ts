import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const PAGES = [
  { path: '/dashboard', name: 'dashboard' },
  { path: '/projects', name: 'proyectos' },
  { path: '/projects/prj_0001?tab=historial', name: 'historial de versiones' },
  { path: '/monitor', name: 'monitor de cambios' },
  { path: '/alerts', name: 'centro de alertas' },
  { path: '/activity', name: 'actividad' },
  { path: '/reports', name: 'reportes' },
  { path: '/settings', name: 'configuración' },
] as const

for (const entry of PAGES) {
  test(`${entry.name} sin violaciones graves de accesibilidad`, async ({
    page,
  }) => {
    await page.goto(entry.path)
    await page.locator('main').waitFor()
    await page.waitForTimeout(800)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    const serious = results.violations.filter(
      (violation) =>
        violation.impact === 'critical' || violation.impact === 'serious',
    )

    expect(
      serious,
      serious
        .map(
          (violation) =>
            `${violation.id}: ${violation.help} (${violation.nodes.length} nodos)`,
        )
        .join('\n'),
    ).toEqual([])
  })
}

test('el primer Tab enfoca el enlace de salto al contenido', async ({
  page,
}) => {
  await page.goto('/dashboard')
  await page.keyboard.press('Tab')

  await expect(
    page.getByRole('link', { name: 'Saltar al contenido' }),
  ).toBeFocused()
})
