import { test, expect } from '@playwright/test'

test('la política de privacidad de Pulso queda intacta', async ({ page }) => {
  // GAP CONOCIDO: la URL limpia /pulso/privacidad la resuelve el CDN de Vercel
  // (ningún server local de Next —dev ni start— sirve el index de directorio),
  // así que acá solo se puede verificar que el archivo existe y renderiza.
  // Una regresión de ruteo exclusiva de Vercel sobre la URL limpia NO la
  // detecta esta suite: verificar https://galfredev.com/pulso/privacidad
  // manualmente después de cada deploy (checklist de release).
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
