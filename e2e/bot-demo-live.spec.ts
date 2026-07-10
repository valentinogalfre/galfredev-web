import { test, expect } from '@playwright/test'

// Contrato de Task 18: la API /api/demo-bot responde SIEMPRE 200 con
// {reply, mode} (salvo body inválido → 400), y el chat con el transporte
// real termina en scripted cuando no hay ANTHROPIC_API_KEY — por la API o
// por la degradación local del BotChat. Ambos caminos son el contrato.

test('la API responde scripted sin ANTHROPIC_API_KEY', async ({ request }) => {
  const res = await request.post('/api/demo-bot', {
    data: { sessionId: 'e2e-visitor-0001', locale: 'es', messages: [{ role: 'user', content: 'hola, precios?' }] },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.mode).toBe('scripted')
  expect(body.reply.length).toBeGreaterThan(10)
})

test('la API valida el body', async ({ request }) => {
  const res = await request.post('/api/demo-bot', { data: { sessionId: 'x', locale: 'es', messages: [] } })
  expect(res.status()).toBe(400)
})

test('el chat sigue funcionando end-to-end con el transporte real', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByTestId('bot-chat')).toHaveAttribute('data-ready', '')
  const input = page.getByTestId('bot-input')
  await input.scrollIntoViewIfNeeded()
  await input.fill('cuánto sale un bot?')
  await input.press('Enter')
  await expect(page.getByTestId('bot-chat').getByText(/whatsapp/i).first()).toBeVisible({ timeout: 8000 })
})
