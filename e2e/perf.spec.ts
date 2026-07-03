import { test, expect } from '@playwright/test'

test('el hero es visible sin esperar al bundle 3D', async ({ page }) => {
  // El .hdr es el asset crítico dentro del Suspense de la escena WebGL:
  // abortarlo simula "el 3D nunca llega" → el crossfade no ocurre nunca y el
  // hero debe quedar completo y usable sobre el teclado CSS.
  await page.route('**/*.hdr', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByText('Software que')).toBeVisible()
  await expect(page.getByTestId('keyboard-hero')).toBeVisible()
  // El teclado visible es el CSS (el deck existe y no fue desmontado)…
  await expect(page.locator('.kb-deck')).toBeVisible()
  // …y su capa sigue opaca: sin primer frame WebGL no hay crossfade que la apague.
  const cssLayerOpacity = await page
    .locator('[data-testid="keyboard-hero"] > div')
    .first()
    .evaluate((el) => getComputedStyle(el).opacity)
  expect(Number(cssLayerOpacity)).toBe(1)
  // El loop de tipeo corre igual sin 3D.
  await expect(page.getByTestId('typed-line')).not.toHaveText('', { timeout: 15_000 })
})

test('con WebGL roto, el hero muestra el fallback CSS', async ({ page }) => {
  // Sin contexto webgl/webgl2, detectTier da 'low' → nunca se monta el canvas.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === 'webgl' || type === 'webgl2' || type === 'experimental-webgl') return null
      return (original as (...a: unknown[]) => unknown).call(this, type, ...args)
    } as typeof HTMLCanvasElement.prototype.getContext
  })
  await page.goto('/')
  await expect(page.getByTestId('keyboard-hero')).toBeVisible()
  await expect(page.locator('.kb-deck')).toBeVisible()
  // Margen holgado: el upgrade WebGL es diferido (load + idle + 2.5 s) — si
  // fuese a montar el canvas, para este punto ya estaría montado.
  await page.waitForTimeout(7000)
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('GPU en cero fuera de viewport: el rAF driver se detiene', async ({ page }) => {
  // El upgrade WebGL es diferido (load + idle + settle) y en dev el bundle de
  // three compila lento: presupuesto propio.
  test.setTimeout(60_000)
  // window.__kbFrames solo existe en development (el webServer de esta suite
  // corre `next dev`): cuenta los invalidate() del RenderDriver de la escena.
  await page.goto('/')
  const canvas = page.locator('[data-testid="keyboard-hero"] canvas')
  try {
    await canvas.waitFor({ state: 'attached', timeout: 20_000 })
  } catch {
    test.skip(true, 'WebGL no disponible en este entorno: no hay driver que medir')
  }
  await page.waitForFunction(() => (window.__kbFrames ?? 0) > 0, undefined, {
    timeout: 10_000,
  })
  // Hero fuera de viewport → inView=false → el rAF loop debe cancelarse.
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  // Poll-until-stable: bajo carga (suite completa en paralelo) el callback del
  // IntersectionObserver puede demorar y colar algún invalidate() tardío — en
  // vez de una foto única antes/después, exigimos el contador PLANO en dos
  // ventanas consecutivas (la detención es un estado estable, no un instante).
  let last = -1
  let stableWindows = 0
  for (let i = 0; i < 12 && stableWindows < 2; i++) {
    await page.waitForTimeout(500)
    const now = await page.evaluate(() => window.__kbFrames ?? 0)
    stableWindows = now === last ? stableWindows + 1 : 0
    last = now
  }
  expect(stableWindows, 'el contador de frames nunca se aplanó: el rAF driver sigue vivo').toBeGreaterThanOrEqual(2)
  const after = last
  // Al volver al hero, el driver retoma.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForFunction(
    (prev) => (window.__kbFrames ?? 0) > (prev ?? 0),
    after,
    { timeout: 10_000 },
  )
})
