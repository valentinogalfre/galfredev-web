import { test, expect } from '@playwright/test'

test('el hero es visible sin esperar al bundle 3D (.hdr abortado → CSS opaco)', async ({
  page,
}) => {
  // Presupuesto propio: el fallback puede llegar por el presupuesto de
  // materialización de 10 s (mount diferido a load+idle + 10 s + fade), y en
  // dev el bundle de three compila lento la primera vez.
  test.setTimeout(90_000)
  // El .hdr es el asset crítico dentro del Suspense de la escena WebGL:
  // abortarlo simula "el 3D nunca llega" → o el loader revienta (boundary) o
  // vence el presupuesto de materialización — en ambos casos el hero debe
  // quedar completo y usable sobre el teclado CSS. NUNCA vacío.
  await page.route('**/*.hdr', (route) => route.abort())
  await page.goto('/')
  await expect(page.getByText('Software que')).toBeVisible()
  await expect(page.getByTestId('keyboard-hero')).toBeVisible()
  // El loop de tipeo corre desde el arranque, con o sin 3D.
  await expect(page.getByTestId('typed-line')).not.toHaveText('', { timeout: 15_000 })
  // El teclado CSS entra como definitivo (clase kb-css-in) y queda OPACO.
  await page.waitForFunction(
    () => {
      const layer = document.querySelector('[data-testid="keyboard-hero"] .kb-css-in')
      return layer !== null && getComputedStyle(layer).opacity === '1'
    },
    undefined,
    { timeout: 60_000 },
  )
  await expect(page.locator('.kb-deck')).toBeVisible()
  // El canvas fallido se desmonta: un solo teclado en pantalla.
  await expect(page.locator('[data-testid="keyboard-hero"] canvas')).toHaveCount(0)
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
  // tier low se resuelve al hidratar → el CSS hace su fade-in inmediato (300ms)
  // y queda opaco: es el único teclado que ve este usuario.
  await page.waitForFunction(
    () => {
      const layer = document.querySelector('[data-testid="keyboard-hero"] .kb-css-in')
      return layer !== null && getComputedStyle(layer).opacity === '1'
    },
    undefined,
    { timeout: 15_000 },
  )
  // Margen holgado: el montaje WebGL es diferido (load + idle + settle) — si
  // fuese a montar el canvas, para este punto ya estaría montado.
  await page.waitForTimeout(7000)
  await expect(page.locator('canvas')).toHaveCount(0)
})

test('tier WebGL: una sola materialización — el teclado CSS nunca se monta', async ({
  page,
}) => {
  // En dev el bundle de three compila lento: presupuesto propio.
  test.setTimeout(60_000)
  await page.goto('/')
  const canvas = page.locator('[data-testid="keyboard-hero"] canvas')
  try {
    await canvas.waitFor({ state: 'attached', timeout: 20_000 })
  } catch {
    test.skip(true, 'WebGL no disponible en este entorno: no hay materialización que medir')
  }
  // Con tier mid/high el CSS se desmonta al hidratar y NO vuelve (salvo fallo):
  // el visitante ve aura → teclado WebGL. Jamás dos teclados.
  await expect(page.locator('.kb-deck')).toHaveCount(0)
  // La materialización llega: la capa del canvas termina opaca…
  await page.waitForFunction(
    () => {
      const el = document
        .querySelector('[data-testid="keyboard-hero"] canvas')
        ?.closest('.kb-mask')
      return !!el && getComputedStyle(el).opacity === '1'
    },
    undefined,
    { timeout: 30_000 },
  )
  // …el aura ya cumplió y se desmontó…
  await expect(page.getByTestId('keyboard-aura')).toHaveCount(0, { timeout: 5_000 })
  // …y el CSS sigue sin existir: nunca hubo doble teclado.
  await expect(page.locator('.kb-deck')).toHaveCount(0)
})

test('GPU en cero fuera de viewport: el rAF driver se detiene', async ({ page }) => {
  // El montaje WebGL es diferido (load + idle + settle) y en dev el bundle de
  // three compila lento: presupuesto propio.
  test.setTimeout(60_000)
  // Instrumentación DESDE el test (funciona contra dev Y prod, sin tocar el
  // bundle): contamos draw calls WebGL reales. Con frameloop="demand", si el
  // RenderDriver se cancela dejan de pedirse frames → los draws se aplanan.
  await page.addInitScript(() => {
    const w = window as unknown as { __glDraws: number }
    w.__glDraws = 0
    const methods = ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']
    for (const proto of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
      for (const name of methods) {
        const target = proto as unknown as Record<string, (...a: unknown[]) => unknown>
        const original = target[name]
        if (typeof original !== 'function') continue
        target[name] = function (...args: unknown[]) {
          w.__glDraws += 1
          return original.apply(this, args)
        }
      }
    }
  })
  const glDraws = () =>
    page.evaluate(() => (window as unknown as { __glDraws?: number }).__glDraws ?? 0)
  await page.goto('/')
  const canvas = page.locator('[data-testid="keyboard-hero"] canvas')
  try {
    await canvas.waitFor({ state: 'attached', timeout: 20_000 })
  } catch {
    test.skip(true, 'WebGL no disponible en este entorno: no hay driver que medir')
  }
  await page.waitForFunction(
    () => ((window as unknown as { __glDraws?: number }).__glDraws ?? 0) > 0,
    undefined,
    { timeout: 10_000 },
  )
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
    const now = await glDraws()
    stableWindows = now === last ? stableWindows + 1 : 0
    last = now
  }
  expect(stableWindows, 'el contador de draws nunca se aplanó: el rAF driver sigue vivo').toBeGreaterThanOrEqual(2)
  const after = last
  // Al volver al hero, el driver retoma.
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForFunction(
    (prev) => ((window as unknown as { __glDraws?: number }).__glDraws ?? 0) > (prev ?? 0),
    after,
    { timeout: 10_000 },
  )
})
