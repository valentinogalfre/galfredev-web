import { test, expect, type Page } from '@playwright/test'
import { getDictionary } from '../src/lib/i18n'

const en = getDictionary('en')

/**
 * El data-testid="locale-switch" existe 2 veces (desktop y sheet mobile).
 * En mobile el de desktop está oculto (hidden lg:block) y el del sheet solo
 * vive con el menú abierto: abrimos el hamburguesa y scopeamos el click a
 * #mobile-navigation.
 *
 * `targetPath`: href esperado del switch. El header vive DENTRO de cada page
 * (no del layout), así que tras una navegación client-side el árbol viejo se
 * desmonta y el nuevo se monta — interactuar durante ese churn pierde clicks.
 * Esperar el href (funciona sobre elementos ocultos) garantiza que el header
 * de la página actual ya está montado antes de tocar nada.
 */
async function clickLocaleSwitch(page: Page, targetPath: string) {
  const headerSwitch = page.getByTestId('locale-switch').first()
  await expect(headerSwitch).toHaveAttribute('href', targetPath)
  if (await headerSwitch.isVisible()) {
    await headerSwitch.click()
    return
  }
  await page.locator('button[aria-controls="mobile-navigation"]').click()
  await page.locator('#mobile-navigation').getByTestId('locale-switch').click()
}

test('todas las páginas en responden 200 con lang=en', async ({ page }) => {
  test.setTimeout(120_000)
  const paths = [
    '/en', '/en/projects', '/en/about',
    ...Object.values(en.services).map((s) => `/en/services/${s.slug}`),
    ...Object.values(en.projects).map((p) => `/en/projects/${p.slug}`),
  ]
  for (const p of paths) {
    const res = await page.goto(p)
    expect(res?.status(), p).toBe(200)
    expect(await page.getAttribute('html', 'lang'), p).toBe('en')
  }
})

test('el switcher es↔en mantiene la página equivalente', async ({ page }) => {
  await page.goto('/servicios/bots-whatsapp')
  await clickLocaleSwitch(page, '/en/services/whatsapp-bots')
  await expect(page).toHaveURL(/\/en\/services\/whatsapp-bots$/)
  await clickLocaleSwitch(page, '/servicios/bots-whatsapp')
  await expect(page).toHaveURL(/\/servicios\/bots-whatsapp$/)
})

test('el switcher funciona desde una página de proyecto', async ({ page }) => {
  await page.goto('/en/projects/pyron')
  await clickLocaleSwitch(page, '/proyectos/pyron')
  await expect(page).toHaveURL(/\/proyectos\/pyron$/)
})

test('sin texto español filtrado en /en (muestreo)', async ({ page }) => {
  test.setTimeout(60_000)
  for (const p of ['/en', '/en/about', `/en/services/${Object.values(en.services)[0].slug}`]) {
    await page.goto(p)
    // El FAB de WhatsApp recién se monta tras scrollear (>520px): scrolleamos
    // para que la UI lazy entre al innerText antes de muestrear.
    await page.evaluate(() => window.scrollTo(0, 1200))
    await expect(
      page.locator('a[aria-label="Open a WhatsApp conversation with GalfreDev"]'),
      `${p} debería montar el FAB en inglés`,
    ).toBeVisible()
    const body = await page.locator('body').innerText()
    // Palabras señal que delatarían copy es sin traducir en páginas en:
    for (const leak of [
      'Hablemos por WhatsApp',
      'Hablar por WhatsApp',
      'Escribile',
      'Contame',
      'Ver el caso',
      'Empezar un proyecto',
    ]) {
      expect(body, `${p} contiene "${leak}"`).not.toContain(leak)
    }
    // En mobile el label del FAB va oculto (hidden sm:block): el aria-label
    // español delataría el leak aunque innerText no lo vea.
    await expect(
      page.locator('a[aria-label="Abrir conversación por WhatsApp con GalfreDev"]'),
      `${p} monta el FAB con aria-label es`,
    ).toHaveCount(0)
  }
})
