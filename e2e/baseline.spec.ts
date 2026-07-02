import { test, expect } from '@playwright/test'

test('la política de privacidad de Pulso queda intacta', async ({ page }) => {
  // Nota: se usa la ruta con index.html porque `next dev` no resuelve el
  // índice de directorio para archivos estáticos con URL limpia (Vercel sí
  // lo hace en producción; verificado 200 en ambos entornos para esta ruta).
  await page.goto('/pulso/privacidad/index.html')
  await expect(page.locator('body')).toContainText(/privacidad/i)
})

test('privacidad y términos responden 200', async ({ page }) => {
  for (const path of ['/privacidad', '/terminos']) {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
  }
})

test('login renderiza', async ({ page }) => {
  const res = await page.goto('/login')
  expect(res?.status()).toBe(200)
})

test('la home renderiza con marca GalfreDev', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText(/galfredev/i)
})
