import { test, expect } from '@playwright/test'

test('hero: titular, CTAs y teclado visibles', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Software que')).toBeVisible()
  await expect(page.getByRole('link', { name: /empezar un proyecto/i })).toBeVisible()
  await expect(page.getByTestId('keyboard-hero')).toBeVisible()
})

test('hero en inglés', async ({ page }) => {
  await page.goto('/en')
  await expect(page.getByText('Software that')).toBeVisible()
})

test('el teclado tipea solo', async ({ page }) => {
  await page.goto('/')
  const typed = page.getByTestId('typed-line')
  await expect(typed).not.toHaveText('', { timeout: 15_000 })
})

test('teclado físico: tipear en el body toma la typed-line y el loop retoma', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'interacción de teclado físico: solo desktop')
  // Budget propio: en dev + GL por software con workers en paralelo el main
  // thread jankea fuerte y el timer de 4s del unpause puede dispararse tarde.
  test.setTimeout(60_000)
  await page.goto('/')
  const typed = page.getByTestId('typed-line')
  // Espera a que el loop arranque: garantiza hero montado + observer activo.
  await expect(typed).not.toHaveText('', { timeout: 15_000 })
  // …y a que la captura del teclado físico esté armada (data-keys-live).
  await expect(page.locator('section[data-keys-live]')).toBeAttached({ timeout: 10_000 })
  await page.keyboard.type('hola', { delay: 80 })
  await expect(typed).toHaveText('HOLA', { timeout: 10_000 })
  // Tras ~4s sin tipear, el loop automático retoma y pisa el buffer del usuario.
  await expect(typed).not.toHaveText('HOLA', { timeout: 25_000 })
})
