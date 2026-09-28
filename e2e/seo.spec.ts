import { test, expect } from '@playwright/test'
import { getDictionary } from '../src/lib/i18n'

// Contrato: cada página espejada declara sus alternates es↔en (hreflang) para
// que Google no trate /en como contenido duplicado y sirva el idioma correcto.
test('hreflang presente en home y servicio', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /\/en$/)
  await expect(page.locator('link[hreflang="x-default"]')).toHaveCount(1)
  await page.goto('/servicios/bots-whatsapp')
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    'href',
    /\/en\/services\/whatsapp-bots$/,
  )
})

// Contrato: datos estructurados por tipo de página (Service en servicios,
// SoftwareApplication en casos, BreadcrumbList en ambas) para rich results.
test('JSON-LD por tipo en cada página', async ({ page }) => {
  await page.goto('/servicios/bots-whatsapp')
  let types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
    (t) => JSON.parse(t)['@type'],
  )
  expect(types.flat()).toContain('Service')
  expect(types.flat()).toContain('BreadcrumbList')
  await page.goto('/proyectos/pyron')
  types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map(
    (t) => JSON.parse(t)['@type'],
  )
  expect(types.flat()).toContain('SoftwareApplication')
})

// Contrato: el sitemap cubre TODO el sitio público en ambos idiomas y jamás
// expone rutas privadas (login/perfil/dashboard).
test('sitemap bilingüe completo', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  for (const url of [
    '/servicios/bots-whatsapp',
    '/en/services/whatsapp-bots',
    '/proyectos/pyron',
    '/en/projects/pyron',
    '/sobre-mi',
    '/en/about',
  ]) {
    expect(xml).toContain(url)
  }
  expect(xml).not.toContain('/login')
})

// Contrato: cada servicio/proyecto tiene su placa OG propia generada por slug.
// Next 16 sirve la ruta file-convention con sufijo hasheado (opengraph-image-xxxx),
// así que seguimos la URL real que emite el meta og:image — la que fetchean los crawlers.
test('OG image de servicio responde', async ({ page, request, baseURL }) => {
  await page.goto('/servicios/bots-whatsapp')
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
  expect(ogImage).toContain('/servicios/bots-whatsapp/opengraph-image')
  // En build de prod metadataBase apunta al dominio público (galfredev.com):
  // lo que valida ESTE build es que la ruta emitida resuelva acá, no en el
  // deploy viejo — fetcheamos path+query contra el server local.
  const { pathname, search } = new URL(ogImage as string, baseURL)
  const res = await request.get(pathname + search)
  expect(res.status()).toBe(200)
  expect(res.headers()['content-type']).toContain('image')
})

test('la home usa el title del rediseño (no el default del layout)', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(getDictionary('es').home.seo.title)
  await page.goto('/en')
  await expect(page).toHaveTitle(getDictionary('en').home.seo.title)
})

// Contrato: al compartir, cada página muestra SU título y SU URL (antes todas
// heredaban og:title/og:url de la home porque el openGraph del layout no se
// fusiona: se reemplaza o se hereda entero).
test('og:url y og:title propios por página', async ({ page }) => {
  const cases = [
    { path: '/servicios/bots-whatsapp', url: /\/servicios\/bots-whatsapp$/ },
    { path: '/en/projects/pyron', url: /\/en\/projects\/pyron$/ },
    { path: '/sobre-mi', url: /\/sobre-mi$/ },
    { path: '/en/projects', url: /\/en\/projects$/ },
  ]
  for (const { path, url } of cases) {
    await page.goto(path)
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', url)
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBe(await page.title())
  }
})
