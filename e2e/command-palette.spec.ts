import { test, expect } from '@playwright/test'

test('el botón del header abre la palette y navega', async ({ page }) => {
  await page.goto('/')
  await page.getByTestId('palette-trigger').first().click()
  await expect(page.getByTestId('command-palette')).toBeVisible()
  await page.keyboard.type('proyectos')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/proyectos/)
})

test('⌘K abre la palette en desktop', async ({ page, isMobile }) => {
  test.skip(isMobile, 'atajo de teclado solo desktop')
  await page.goto('/')
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.getByTestId('command-palette')).toBeVisible()
})
