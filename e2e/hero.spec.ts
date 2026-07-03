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
  await expect(typed).not.toHaveText('', { timeout: 8000 })
})
