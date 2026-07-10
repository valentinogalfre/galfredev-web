import { test, expect } from '@playwright/test'
import { getDictionary } from '../src/lib/i18n'

// Contrato: el <title> es EXACTAMENTE seo.title del dict (title.absolute en la
// ruta — el template '%s | GalfreDev' del layout lo duplicaría) y el slot de
// micro-demo (Task 20) está presente en cada página de servicio.
test('cada servicio es renderiza con su title y micro-demo slot', async ({ page }) => {
  for (const svc of Object.values(getDictionary('es').services)) {
    await page.goto(`/servicios/${svc.slug}`)
    await expect(page).toHaveTitle(svc.seo.title)
    await expect(page.getByTestId('micro-demo-slot')).toBeVisible()
  }
})

// Contrato: las rutas /en/services/[slug] existen y NO caen en el catch-all
// /en/[...rest] (que devuelve 404).
test('cada servicio en renderiza', async ({ page }) => {
  for (const svc of Object.values(getDictionary('en').services)) {
    const res = await page.goto(`/en/services/${svc.slug}`)
    expect(res?.status()).toBe(200)
    await expect(page).toHaveTitle(svc.seo.title)
  }
})

test('slug inválido da 404', async ({ page }) => {
  const res = await page.goto('/servicios/no-existe')
  expect(res?.status()).toBe(404)
})

test('slug inválido en inglés da 404', async ({ page }) => {
  const res = await page.goto('/en/services/does-not-exist')
  expect(res?.status()).toBe(404)
})
