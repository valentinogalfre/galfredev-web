import { test, expect } from '@playwright/test'

// Contrato: el chat demo responde guionado en local (sin API) y la
// interacción del visitante (input o chip) corta el autoplay y toma el mando.

test('el bot demo responde guionado', async ({ page }) => {
  await page.goto('/')
  const input = page.getByTestId('bot-input')
  await input.scrollIntoViewIfNeeded()
  // fill() enfoca el input → corta el autoplay aunque esté a mitad del guion.
  await input.fill('cuánto sale un bot de whatsapp?')
  await input.press('Enter')
  await expect(
    page.getByTestId('bot-chat').getByText(/rango real por WhatsApp/i),
  ).toBeVisible({ timeout: 6000 })
})

test('los chips de sugerencia envían', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('bot-chat').scrollIntoViewIfNeeded()
  await page.getByRole('button', { name: '¿Qué hace un bot?' }).click()
  const log = page.getByTestId('bot-chat').getByRole('log')
  // El chip queda como mensaje del usuario…
  await expect(log.getByText('¿Qué hace un bot?')).toBeVisible()
  // …y el bot contesta con la regla de bots.
  await expect(log.getByText(/filtran leads/i)).toBeVisible({ timeout: 6000 })
})

test('el bot demo existe en la home en inglés', async ({ page }) => {
  await page.goto('/en')
  const input = page.getByTestId('bot-input')
  await input.scrollIntoViewIfNeeded()
  await input.fill('how much is a website?')
  await input.press('Enter')
  await expect(page.getByTestId('bot-chat').getByText(/real range on WhatsApp/i)).toBeVisible({
    timeout: 6000,
  })
})
