import { test, expect } from '@playwright/test'

test('la home tiene servicios y proceso nuevos (es)', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#servicios')).toHaveCount(1)
  await expect(page.locator('#proceso')).toHaveCount(1)
  const cards = page.locator('#servicios a[href*="/servicios/"]')
  await expect(cards).toHaveCount(5)
})

test('la home en tiene services y process', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('#services')).toHaveCount(1)
  const cards = page.locator('#services a[href*="/services/"]')
  await expect(cards).toHaveCount(5)
})
