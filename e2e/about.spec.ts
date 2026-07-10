import { test, expect } from '@playwright/test'

test('sobre-mi renderiza con historia y certificaciones', async ({ page }) => {
  await page.goto('/sobre-mi')
  // seo.title del dict: 'Valentino Galfré — desarrollador de software | GalfreDev'
  await expect(page).toHaveTitle(/valentino/i)
  await expect(page.getByRole('img', { name: /valentino/i })).toBeVisible()
  await expect(page.getByText(/coderhouse/i).first()).toBeVisible()
})

test('/en/about renderiza', async ({ page }) => {
  const res = await page.goto('/en/about')
  expect(res?.status()).toBe(200)
  expect(await page.getAttribute('html', 'lang')).toBe('en')
})
