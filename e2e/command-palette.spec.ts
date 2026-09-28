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
  // El atajo lo escucha un efecto del cliente: bajo carga, un ⌘K previo a la
  // hidratación se pierde. data-keys-live lo setea el efecto del hero en el
  // mismo commit de hidratación → a partir de ahí el listener ya existe.
  await expect(page.locator('[data-keys-live]')).toBeAttached()
  await page.keyboard.press('ControlOrMeta+k')
  await expect(page.getByTestId('command-palette')).toBeVisible()
})
