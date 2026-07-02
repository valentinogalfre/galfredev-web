import { test, expect } from '@playwright/test'

test('/en responde 200 con lang correcto', async ({ page }) => {
  const res = await page.goto('/en')
  expect(res?.status()).toBe(200)
  expect(await page.getAttribute('html', 'lang')).toBe('en')
})

test('la raíz mantiene lang es', async ({ page }) => {
  await page.goto('/')
  expect(await page.getAttribute('html', 'lang')).toBe('es')
})
