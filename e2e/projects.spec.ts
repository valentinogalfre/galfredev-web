import { test, expect } from '@playwright/test'
import { getDictionary } from '../src/lib/i18n'

test('grilla de proyectos con filtro', async ({ page }) => {
  await page.goto('/proyectos')
  await expect(page.getByTestId('project-card')).toHaveCount(4)
  // 'Apps' filtra por project.services: pyron + pulso lo incluyen.
  await page.getByRole('button', { name: /^Apps$/i }).click()
  await expect(page.getByTestId('project-card')).toHaveCount(2)
})

test('cada caso se renderiza con su title', async ({ page }) => {
  for (const p of Object.values(getDictionary('es').projects)) {
    await page.goto(`/proyectos/${p.slug}`)
    await expect(page).toHaveTitle(new RegExp(p.name.split(' ')[0], 'i'))
  }
})

test('casos en inglés', async ({ page }) => {
  for (const p of Object.values(getDictionary('en').projects)) {
    const res = await page.goto(`/en/projects/${p.slug}`)
    expect(res?.status()).toBe(200)
  }
})

test('slug inválido de proyecto da 404', async ({ page }) => {
  const res = await page.goto('/proyectos/no-existe')
  expect(res?.status()).toBe(404)
})
