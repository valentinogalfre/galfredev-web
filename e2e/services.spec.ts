import { test, expect } from '@playwright/test'
import { getDictionary } from '../src/lib/i18n'

// Contrato: el <title> es EXACTAMENTE seo.title del dict (title.absolute en la
// ruta — el template '%s | GalfreDev' del layout lo duplicaría) y el slot de
// micro-demo (Task 20) está presente en cada página de servicio.
test('cada servicio es renderiza con su title y micro-demo slot', async ({ page }) => {
  for (const svc of Object.values(getDictionary('es').services)) {
    await page.goto(`/servicios/${svc.slug}`)
    await expect(page).toHaveTitle(svc.seo.title)
    await expect(page.getByTestId('micro-demo-slot')).toBeVisible()
  }
})

// Contrato: las rutas /en/services/[slug] existen y NO caen en el catch-all
// /en/[...rest] (que devuelve 404).
test('cada servicio en renderiza', async ({ page }) => {
  for (const svc of Object.values(getDictionary('en').services)) {
    const res = await page.goto(`/en/services/${svc.slug}`)
    expect(res?.status()).toBe(200)
    await expect(page).toHaveTitle(svc.seo.title)
  }
})

test('slug inválido da 404', async ({ page }) => {
  const res = await page.goto('/servicios/no-existe')
  expect(res?.status()).toBe(404)
})

test('slug inválido en inglés da 404', async ({ page }) => {
  const res = await page.goto('/en/services/does-not-exist')
  expect(res?.status()).toBe(404)
})

// Contratos de las micro-demos live (Task 20): funcionales e interactivas —
// el visitante las opera. Las demos cargan lazy (ssr: false), así que los
// locators esperan a que el chunk hidrate antes de interactuar.

test('la micro-demo de bots-whatsapp es interactiva', async ({ page }) => {
  await page.goto('/servicios/bots-whatsapp')
  const demo = page.getByTestId('micro-demo')
  await demo.scrollIntoViewIfNeeded()
  // Elegir la rama revela el primer mensaje; cada tap avanza uno más.
  await demo.getByRole('button', { name: /quiero un turno/i }).click()
  await demo.getByRole('button', { name: /siguiente mensaje/i }).click()
  await demo.getByRole('button', { name: /siguiente mensaje/i }).click()
  // Scope al log: el header («Consultorio Dra. Pérez») también la menciona.
  await expect(demo.getByRole('log').getByText(/dra\. pérez/i)).toBeVisible()
})

test('la micro-demo de bots-whatsapp cierra con el resultado y permite reiniciar', async ({
  page,
}) => {
  await page.goto('/servicios/bots-whatsapp')
  const demo = page.getByTestId('micro-demo')
  await demo.scrollIntoViewIfNeeded()
  await demo.getByRole('button', { name: /tengo una urgencia/i }).click()
  const next = demo.getByRole('button', { name: /siguiente mensaje/i })
  // La rama urgencia tiene 5 mensajes: 4 taps más revelan hasta el system.
  for (let i = 0; i < 4; i++) await next.click()
  await expect(demo.getByText(/prioridad alta/i)).toBeVisible()
  // Reiniciar vuelve al selector de ramas.
  await demo.getByRole('button', { name: /probar otra conversación/i }).click()
  await expect(demo.getByRole('button', { name: /quiero un turno/i })).toBeVisible()
})

test('la micro-demo de webs construye el sitio', async ({ page }) => {
  await page.goto('/servicios/webs')
  const demo = page.getByTestId('micro-demo')
  await demo.scrollIntoViewIfNeeded()
  await demo.getByRole('button', { name: /construir/i }).click()
  // El ensamblado tarda ~2s; al completarse aparece el badge de performance.
  await expect(demo.getByText(/lighthouse 98/i)).toBeVisible({ timeout: 6000 })
  await expect(demo.getByRole('button', { name: /reconstruir/i })).toBeVisible()
})

test('la micro-demo de apps navega tabs', async ({ page }) => {
  await page.goto('/servicios/apps')
  const demo = page.getByTestId('micro-demo')
  await demo.scrollIntoViewIfNeeded()
  await demo.getByRole('tab', { name: /nuevo/i }).click()
  await expect(demo.getByText(/eleg/i).first()).toBeVisible()
  // Flujo de alta en 2 taps: servicio → horario → confirmación animada.
  await demo.getByRole('button', { name: /corte 30 min/i }).click()
  await demo.getByRole('button', { name: '10:30' }).click()
  await expect(demo.getByText(/turno confirmado/i)).toBeVisible()
})
