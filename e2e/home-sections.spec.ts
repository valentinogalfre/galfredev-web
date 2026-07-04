import { test, expect } from '@playwright/test'

test('la home tiene servicios y proceso nuevos (es)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#servicios')).toHaveCount(1)
  await expect(page.locator('#proceso')).toHaveCount(1)
  const cards = page.locator('#servicios a[href*="/servicios/"]')
  await expect(cards).toHaveCount(5)
})

test('la sección proyectos apila 4 casos', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#proyectos')).toHaveCount(1)
  await expect(page.locator('#proyectos a[href*="/proyectos/"]')).toHaveCount(4)
  // .first(): «Pyron» también aparece en el wordmark del placeholder del frame — .first() evita el strict mode.
  await expect(page.locator('#proyectos').getByText('Pyron').first()).toBeVisible()
})

test('la home en tiene services y process', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#services')).toHaveCount(1)
  const cards = page.locator('#services a[href*="/services/"]')
  await expect(cards).toHaveCount(5)
})

test('la home es completa: orden y anchors', async ({ page }) => {
  await page.goto('/')
  const ids = await page
    .locator('main section[id]')
    .evaluateAll((els) => els.map((e) => e.id))
  expect(ids).toEqual(['servicios', 'proyectos', 'demo', 'proceso', 'roi', 'contacto'])
})

test('la home en es completa: orden y anchors', async ({ page }) => {
  await page.goto('/en')
  const ids = await page
    .locator('main section[id]')
    .evaluateAll((els) => els.map((e) => e.id))
  expect(ids).toEqual(['services', 'projects', 'demo', 'process', 'roi', 'contact'])
})

test('el form de contacto envía (API mockeada)', async ({ page }) => {
  // Sin whatsappUrl en la respuesta para que no intente redirigir fuera del test.
  await page.route('**/api/lead', (route) =>
    route.fulfill({ status: 200, json: { ok: true, message: 'ok' } }),
  )

  await page.goto('/#contacto')

  // Gate de hidratación: los inputs son controlados — un fill antes de que React
  // hidrate se borra. El checkbox solo togglea con los handlers vivos, así que
  // reintentar el click hasta que aria-checked cambie garantiza hidratación.
  const privacy = page.getByRole('checkbox', { name: /política de privacidad/ })
  await expect(async () => {
    await privacy.click()
    await expect(privacy).toHaveAttribute('aria-checked', 'true', { timeout: 300 })
  }).toPass()

  await page.getByLabel('Nombre y apellido').fill('Prueba Playwright')
  await page.getByLabel('Email', { exact: true }).fill('prueba@example.com')
  await page.getByLabel('WhatsApp', { exact: true }).fill('+54 9 351 5551234')
  await page
    .getByLabel('Contame el contexto')
    .fill('Tengo tareas repetitivas de carga de datos que quiero automatizar pronto.')

  await page.getByRole('button', { name: /Necesidad principal/ }).click()
  await page.getByRole('option', { name: 'Automatización interna' }).click()

  await page.getByRole('button', { name: 'Pedir propuesta o diagnóstico' }).click()

  await expect(
    page.getByText('Tu consulta quedó registrada. Te llevamos a WhatsApp para continuar.'),
  ).toBeVisible()
})
