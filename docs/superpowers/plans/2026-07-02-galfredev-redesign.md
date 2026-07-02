# GalfreDev Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseño completo de galfredev.com: multi-página bilingüe (es raíz / `/en`), teclado 3D WebGL como pieza central, demos live interactivas, bot IA real, SEO por página — según `docs/superpowers/specs/2026-07-02-galfredev-redesign-design.md` (leer ANTES de ejecutar cualquier tarea).

**Architecture:** Next.js 16 App Router con dos root layouts por route groups (`(es)` en raíz, `(en)` bajo `/en`) y contenido 100% centralizado en diccionarios tipados por locale. El teclado 3D vive aislado tras un boundary `next/dynamic` con fallback CSS; el LCP nunca depende de WebGL. Cada fase termina con el sitio funcionando y `npm run check` + e2e verdes.

**Tech Stack:** Next.js 16, React 19, Tailwind v4, framer-motion 12, three + @react-three/fiber + @react-three/drei (+postprocessing), lenis, cmdk, @anthropic-ai/sdk (Claude Haiku), Supabase, Playwright, Vitest.

**Nota de alcance (override declarado):** en componentes puramente visuales (secciones, micro-demos 2-5) este plan da la estructura compilable, el modelo de estado completo y el test de contrato — el JSX de detalle se termina iterando visualmente contra el design system (paleta/tokens del spec §3). Todo lo estructural (tipos, i18n, teclado, API, SEO, migraciones) está con código completo.

**Reglas transversales (aplican a TODAS las tareas):**
- Mobile-first: todo componente se maqueta primero a 360px y luego se expande.
- Todo copy sale del diccionario (`getDictionary`) — nada hardcodeado en JSX.
- Toda animación respeta `prefers-reduced-motion` (los primitives de motion lo resuelven una sola vez).
- Colores solo vía tokens CSS existentes (`--color-accent`, `--color-warm`, etc.).
- Commits frecuentes en español, formato actual del repo (`feat:`, `fix:`, `docs:`).

---

## Fase 0 — Tooling y red de seguridad

### Task 1: Dependencias y scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Instalar dependencias de producción**

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing lenis cmdk @anthropic-ai/sdk
```

- [ ] **Step 2: Instalar dependencias de desarrollo**

```bash
npm install -D @playwright/test vitest @types/three
npx playwright install chromium
```

- [ ] **Step 3: Agregar scripts a `package.json`** (mantener los existentes)

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"check": "npm run lint && npm run typecheck && npm run test && npm run build"
```

- [ ] **Step 4: Verificar que todo instala y el check existente sigue verde**

Run: `npm run lint && npm run typecheck`
Expected: sin errores.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: deps para rediseño (r3f, lenis, cmdk, anthropic, playwright, vitest)"
```

### Task 2: Baseline e2e — contratos que deben SOBREVIVIR al rediseño

Estos tests protegen lo que NO puede romperse mientras rediseñamos. Se escriben contra el sitio actual y deben quedar verdes al final de cada fase.

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/baseline.spec.ts`
- Create: `vitest.config.ts`

- [ ] **Step 1: Crear `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  use: { baseURL: 'http://localhost:3100' },
  projects: [
    { name: 'mobile', use: { ...devices['iPhone 13'] } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev -- --port 3100',
    port: 3100,
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
```

- [ ] **Step 2: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: { include: ['src/**/*.test.ts'] },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
```

- [ ] **Step 3: Escribir `e2e/baseline.spec.ts`** — contrato: rutas legales y de cuenta siguen vivas

```ts
import { test, expect } from '@playwright/test'

test('la política de privacidad de Pulso queda intacta', async ({ page }) => {
  await page.goto('/pulso/privacidad')
  await expect(page.locator('body')).toContainText(/privacidad/i)
})

test('privacidad y términos responden 200', async ({ page }) => {
  for (const path of ['/privacidad', '/terminos']) {
    const res = await page.goto(path)
    expect(res?.status()).toBe(200)
  }
})

test('login renderiza', async ({ page }) => {
  const res = await page.goto('/login')
  expect(res?.status()).toBe(200)
})

test('la home renderiza con marca GalfreDev', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('body')).toContainText(/galfredev/i)
})
```

- [ ] **Step 4: Correr y verificar verde contra el sitio ACTUAL**

Run: `npm run test:e2e`
Expected: 8 passed (4 tests × 2 proyectos).

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts vitest.config.ts e2e/
git commit -m "test: baseline e2e de contratos que sobreviven al rediseño"
```

---

## Fase 1 — Capa de contenido + i18n

### Task 3: Tipos de contenido y `getDictionary` (TDD)

**Files:**
- Create: `src/types/content.ts`
- Create: `src/lib/i18n.ts`
- Create: `src/lib/i18n.test.ts`
- Create: `src/content/es/index.ts`, `src/content/en/index.ts` (mínimos para que compile)

- [ ] **Step 1: Escribir `src/types/content.ts`** — el contrato de TODO el contenido del sitio

```ts
export type Locale = 'es' | 'en'
export const LOCALES: Locale[] = ['es', 'en']
export const DEFAULT_LOCALE: Locale = 'es'

export type ServiceId =
  | 'bots-whatsapp'
  | 'webs'
  | 'apps'
  | 'automatizaciones-ia'
  | 'software-a-medida'

export type ProjectId = 'pyron' | 'pulso' | 'bot-ime' | 'orbita'

export type Cta = { label: string; href: string }

export type SeoMeta = { title: string; description: string }

export type ServiceContent = {
  id: ServiceId
  slug: string // slug localizado para la URL
  name: string // nombre corto (nav, cards)
  seo: SeoMeta
  hero: { eyebrow: string; title: string; italic: string; sub: string }
  benefits: { title: string; detail: string }[]
  demoTitle: string
  demoHint: string // "probalo:" — invitación a usar la micro-demo
  relatedProjects: ProjectId[]
  whatsappMessage: string // mensaje prearmado del CTA
}

export type ProjectContent = {
  id: ProjectId
  slug: string
  name: string
  tagline: string
  seo: SeoMeta
  problem: string
  solution: string
  stack: string[]
  results: string[]
  services: ServiceId[]
  image: string // ruta bajo /public/images/projects/
}

export type HomeContent = {
  seo: SeoMeta
  hero: {
    eyebrow: string
    titlePrefix: string // "Software que"
    rotatingWords: string[] // ["no duerme.", "vende por vos.", "atiende 24/7."]
    sub: string
    ctaPrimary: Cta
    ctaSecondary: Cta
    typedWords: string[] // lo que tipea el teclado: ["WHATSAPP", "APPS", "IA", ...]
  }
  services: { title: string; sub: string }
  projects: { title: string; sub: string }
  botDemo: { title: string; sub: string; inputPlaceholder: string; limitNote: string }
  process: { title: string; steps: { title: string; description: string; outcome: string }[] }
  roi: { title: string; sub: string }
  about: { title: string; teaser: string; cta: Cta }
  contact: { title: string; sub: string }
}

export type AboutContent = {
  seo: SeoMeta
  title: string
  story: string[]
  stackGroups: { label: string; items: string[] }[]
  certifications: { id: string; title: string; issuer: string; date: string; image: string }[]
}

export type CommonContent = {
  brand: string
  nav: { label: string; href: string }[]
  localeSwitch: string // "EN" | "ES" (etiqueta del switcher)
  ctaTalk: string
  footer: { rights: string; madeIn: string }
  whatsappBaseMessage: string
  commandPalette: { placeholder: string; groups: { pages: string; actions: string } }
  notFound: { title: string; back: string }
}

export type Dictionary = {
  common: CommonContent
  home: HomeContent
  services: Record<ServiceId, ServiceContent>
  projects: Record<ProjectId, ProjectContent>
  about: AboutContent
}
```

- [ ] **Step 2: Escribir el test que falla — `src/lib/i18n.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { getDictionary, serviceByLocalizedSlug, projectByLocalizedSlug, localizedPath } from './i18n'

describe('getDictionary', () => {
  it('devuelve diccionarios completos para es y en', () => {
    const es = getDictionary('es')
    const en = getDictionary('en')
    expect(es.common.brand).toBe('GalfreDev')
    expect(en.common.brand).toBe('GalfreDev')
    // paridad estructural: mismos servicios y proyectos en ambos idiomas
    expect(Object.keys(en.services).sort()).toEqual(Object.keys(es.services).sort())
    expect(Object.keys(en.projects).sort()).toEqual(Object.keys(es.projects).sort())
  })
  it('ningún string queda vacío en ningún idioma', () => {
    for (const locale of ['es', 'en'] as const) {
      const walk = (v: unknown, path: string) => {
        if (typeof v === 'string') expect(v.trim(), path).not.toBe('')
        else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`))
        else if (v && typeof v === 'object')
          Object.entries(v).forEach(([k, x]) => walk(x, `${path}.${k}`))
      }
      walk(getDictionary(locale), locale)
    }
  })
})

describe('slugs localizados', () => {
  it('resuelve servicio por slug en cada idioma', () => {
    expect(serviceByLocalizedSlug('es', 'bots-whatsapp')?.id).toBe('bots-whatsapp')
    expect(serviceByLocalizedSlug('en', 'whatsapp-bots')?.id).toBe('bots-whatsapp')
    expect(serviceByLocalizedSlug('es', 'no-existe')).toBeUndefined()
  })
  it('resuelve proyecto por slug', () => {
    expect(projectByLocalizedSlug('es', 'pyron')?.id).toBe('pyron')
  })
})

describe('localizedPath', () => {
  it('arma rutas con prefijo /en solo para inglés', () => {
    expect(localizedPath('es', '/proyectos')).toBe('/proyectos')
    expect(localizedPath('en', '/projects')).toBe('/en/projects')
    expect(localizedPath('en', '/')).toBe('/en')
  })
})
```

- [ ] **Step 3: Correr y verificar que falla**

Run: `npm run test`
Expected: FAIL — `Cannot find module './i18n'`.

- [ ] **Step 4: Implementar `src/lib/i18n.ts`**

```ts
import type { Dictionary, Locale, ServiceContent, ProjectContent } from '@/types/content'
import { es } from '@/content/es'
import { en } from '@/content/en'

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function serviceByLocalizedSlug(locale: Locale, slug: string): ServiceContent | undefined {
  return Object.values(dictionaries[locale].services).find((s) => s.slug === slug)
}

export function projectByLocalizedSlug(locale: Locale, slug: string): ProjectContent | undefined {
  return Object.values(dictionaries[locale].projects).find((p) => p.slug === slug)
}

/** path SIN prefijo de locale → ruta final ("/en" solo para inglés). */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === 'es') return path
  return path === '/' ? '/en' : `/en${path}`
}
```

- [ ] **Step 5: Crear `src/content/es/index.ts` y `src/content/en/index.ts` mínimos** que exporten `es`/`en: Dictionary` con contenido real de `common` + `home` (ver Task 4 para el copy completo; en esta task alcanza con que compile y pase el test con services/projects como objetos completos de UN servicio y UN proyecto — el resto se agrega en Tasks 4/19/22 manteniendo el test de vacíos verde).

**IMPORTANTE:** `Record<ServiceId, …>` obliga a las 5 keys → para que typecheck pase en esta task, definir los 5 servicios y 4 proyectos ya con contenido real (usar los fact sheets de Tasks 19 y 22 como fuente). No usar strings placeholder tipo "TODO" — el test de vacíos los caza igual si quedan `''`.

- [ ] **Step 6: Correr tests y typecheck hasta verde**

Run: `npm run test && npm run typecheck`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/types/content.ts src/lib/i18n.ts src/lib/i18n.test.ts src/content/
git commit -m "feat(i18n): capa de contenido tipada bilingüe con diccionarios es/en"
```

### Task 4: Copy completo es/en de `common` y `home`

**Files:**
- Modify: `src/content/es/index.ts`
- Modify: `src/content/en/index.ts`

- [ ] **Step 1: Contenido `common` + `home` en español** (voz: rioplatense, directa, segunda persona "vos"; sin jerga técnica en beneficios)

```ts
// src/content/es/index.ts — fragmento common/home (integrar en el objeto es)
common: {
  brand: 'GalfreDev',
  nav: [
    { label: 'Servicios', href: '/#servicios' },
    { label: 'Proyectos', href: '/proyectos' },
    { label: 'Proceso', href: '/#proceso' },
    { label: 'Sobre mí', href: '/sobre-mi' },
    { label: 'Contacto', href: '/#contacto' },
  ],
  localeSwitch: 'EN',
  ctaTalk: 'Hablemos',
  footer: { rights: 'Todos los derechos reservados.', madeIn: 'Hecho en Córdoba, Argentina.' },
  whatsappBaseMessage: 'Hola, me gustaría consultar por los servicios de GalfreDev.',
  commandPalette: {
    placeholder: 'Buscar páginas, servicios, proyectos…',
    groups: { pages: 'Páginas', actions: 'Acciones' },
  },
  notFound: { title: 'Esta página no existe (todavía).', back: 'Volver al inicio' },
},
home: {
  seo: {
    title: 'GalfreDev | Software a medida, bots de WhatsApp e IA aplicada',
    description:
      'Desarrollo webs, apps, bots de WhatsApp, automatizaciones e IA aplicada para negocios. Software a medida que trabaja 24/7. Córdoba, Argentina.',
  },
  hero: {
    eyebrow: 'CÓRDOBA, ARGENTINA — DISPONIBLE PARA PROYECTOS',
    titlePrefix: 'Software que',
    rotatingWords: ['no duerme.', 'vende por vos.', 'atiende 24/7.'],
    sub: 'Bots de WhatsApp, webs, apps e IA aplicada. Construido a medida, trabajando todo el día para tu negocio.',
    ctaPrimary: { label: 'Empezar un proyecto', href: '#contacto' },
    ctaSecondary: { label: 'Ver proyectos', href: '/proyectos' },
    typedWords: ['WHATSAPP', 'APPS', 'WEBS', 'IA', 'AUTOMATIZAR'],
  },
  services: { title: 'Qué construyo', sub: 'Cinco formas de hacer que tu negocio trabaje solo.' },
  projects: { title: 'Casos reales', sub: 'Software en producción, usado todos los días.' },
  botDemo: {
    title: 'Probalo vos mismo',
    sub: 'Este bot es real: preguntale lo que quieras sobre mis servicios. Así atendería a tus clientes.',
    inputPlaceholder: 'Escribile al bot…',
    limitNote: 'Demo limitada por visitante. Para la versión completa, hablemos.',
  },
  process: {
    title: 'Cómo trabajo',
    steps: [
      { title: 'Diagnóstico de negocio', description: 'Ubicamos dónde se pierde tiempo, control o facturación y qué conviene atacar primero.', outcome: 'Problema real definido, prioridad e impacto claros.' },
      { title: 'Implementación enfocada', description: 'Armamos la solución con el nivel justo de automatización, integración o software.', outcome: 'En marcha rápido y con sentido operativo.' },
      { title: 'Ajuste y mejora continua', description: 'Medimos qué funcionó, corregimos fricción real y definimos el siguiente paso útil.', outcome: 'La solución acompaña el crecimiento sin congelarse.' },
    ],
  },
  roi: { title: '¿Cuánto te devuelve?', sub: 'Calculá el retorno de automatizar tu operación.' },
  about: {
    title: 'Quién está detrás',
    teaser: 'Soy Valentino Galfré: estudiante de Ingeniería en Sistemas y desarrollador. Construyo software real para negocios reales — de la idea a producción.',
    cta: { label: 'Conocé mi historia', href: '/sobre-mi' },
  },
  contact: { title: 'Hablemos', sub: 'Contame tu idea o tu problema. Respondo en el día.' },
},
```

- [ ] **Step 2: Traducción `common` + `home` al inglés** (voz: inglés natural de marketing, no traducción literal)

```ts
// src/content/en/index.ts — fragmento (nav hrefs usan paths ingleses SIN /en; localizedPath agrega el prefijo)
common: {
  brand: 'GalfreDev',
  nav: [
    { label: 'Services', href: '/#services' },
    { label: 'Projects', href: '/projects' },
    { label: 'Process', href: '/#process' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/#contact' },
  ],
  localeSwitch: 'ES',
  ctaTalk: "Let's talk",
  footer: { rights: 'All rights reserved.', madeIn: 'Built in Córdoba, Argentina.' },
  whatsappBaseMessage: "Hi! I'd like to ask about GalfreDev's services.",
  commandPalette: {
    placeholder: 'Search pages, services, projects…',
    groups: { pages: 'Pages', actions: 'Actions' },
  },
  notFound: { title: "This page doesn't exist (yet).", back: 'Back home' },
},
home: {
  seo: {
    title: 'GalfreDev | Custom software, WhatsApp bots & applied AI',
    description:
      'I build websites, apps, WhatsApp bots, automations and applied AI for businesses. Custom software that works 24/7. Córdoba, Argentina.',
  },
  hero: {
    eyebrow: 'CÓRDOBA, ARGENTINA — AVAILABLE FOR PROJECTS',
    titlePrefix: 'Software that',
    rotatingWords: ['never sleeps.', 'sells for you.', 'answers 24/7.'],
    sub: 'WhatsApp bots, websites, apps and applied AI. Custom-built, working around the clock for your business.',
    ctaPrimary: { label: 'Start a project', href: '#contact' },
    ctaSecondary: { label: 'See projects', href: '/projects' },
    typedWords: ['WHATSAPP', 'APPS', 'WEBSITES', 'AI', 'AUTOMATE'],
  },
  /* …resto espejando la estructura es con copy en inglés natural… */
},
```

- [ ] **Step 3: Verificar paridad y no-vacíos**

Run: `npm run test && npm run typecheck`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/content/
git commit -m "feat(contenido): copy completo es/en de common y home"
```

### Task 5: Route groups (es)/(en) y switch de idioma

Reestructura para tener dos root layouts (patrón "multiple root layouts" de Next). Las URLs actuales NO cambian (los groups no afectan paths).

**Files:**
- Create: `src/app/(es)/layout.tsx` (root layout es), `src/app/(en)/layout.tsx` (root layout en)
- Create: `src/components/layout/root-shell.tsx` (markup compartido entre ambos)
- Move: TODO lo que hoy está en `src/app/*` (page, login, perfil, dashboard, privacidad, terminos, pulso, auth, error, not-found) → `src/app/(es)/…`. Quedan en `src/app/` raíz: `globals.css`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`, `api/`.
- Create: `src/app/(en)/en/page.tsx` (home en inglés — por ahora renderiza el mismo HomePage con locale en)

- [ ] **Step 1: Crear `src/components/layout/root-shell.tsx`** — extrae el body actual de `layout.tsx`

```tsx
import type { Locale } from '@/types/content'
import { getDictionary } from '@/lib/i18n'
import { WhatsAppFab } from '@/components/layout/whatsapp-fab'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function RootShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const dict = getDictionary(locale)
  return (
    <body className="antialiased">
      <a href="#contenido-principal" className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-slate-950 focus:not-sr-only">
        {locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      {children}
      <WhatsAppFab locale={locale} message={dict.common.whatsappBaseMessage} />
      <Analytics />
      <SpeedInsights />
    </body>
  )
}
```

- [ ] **Step 2: Crear los dos root layouts.** `src/app/(es)/layout.tsx` = el layout actual con `<html lang="es">` envolviendo `<RootShell locale="es">` (fonts y metadata base se mudan acá). `(en)/layout.tsx` idéntico con `lang="en"` y metadata en inglés. El `layout.tsx` raíz se ELIMINA. El JSON-LD global se muda a cada layout con el locale correspondiente.

- [ ] **Step 3: Mover rutas existentes al group `(es)`**

```bash
mkdir -p "src/app/(es)"
git mv src/app/page.tsx src/app/error.tsx src/app/not-found.tsx "src/app/(es)/"
git mv src/app/login src/app/perfil src/app/dashboard src/app/privacidad src/app/terminos src/app/pulso src/app/auth "src/app/(es)/"
```

(`api/`, `globals.css`, `robots.ts`, `sitemap.ts`, `opengraph-image.tsx` quedan en la raíz de `app/`.)

**Nota:** si `next build` reclama root `not-found` sin root layout, mover `not-found.tsx` de vuelta a `src/app/not-found.tsx` envolviéndolo con su propio `<html>` mínimo — verificar por ejecución, no asumir.

- [ ] **Step 4: Crear `src/app/(en)/en/page.tsx`** que renderice el mismo componente de home (por ahora el actual) — la home nueva llega en Fase 3/4; acá solo se establece la ruta.

- [ ] **Step 5: Agregar e2e `e2e/i18n.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('/en responde 200 con lang correcto', async ({ page }) => {
  const res = await page.goto('/en')
  expect(res?.status()).toBe(200)
  expect(await page.getAttribute('html', 'lang')).toBe('en')
})

test('la raíz mantiene lang es', async ({ page }) => {
  await page.goto('/')
  expect(await page.getAttribute('html', 'lang')).toBe('es')
})
```

- [ ] **Step 6: Verificar TODO verde (baseline incluido — las URLs viejas no cambian)**

Run: `npm run check && npm run test:e2e`
Expected: PASS completo.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(i18n): route groups (es)/(en) con root layouts propios y /en operativo"
```

---

## Fase 2 — Shell: motion primitives, header/footer, ⌘K

### Task 6: Motion primitives + Lenis

**Files:**
- Create: `src/components/motion/marquee.tsx`, `src/components/motion/sticky-stack.tsx`, `src/components/motion/draw-line.tsx`, `src/components/motion/parallax.tsx`, `src/components/motion/lenis-provider.tsx`
- Keep: `reveal.tsx`, `stagger-reveal.tsx` existentes (se reutilizan)

- [ ] **Step 1: `lenis-provider.tsx`** — smooth scroll SOLO desktop, respeta reduced-motion

```tsx
'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isDesktop || reduced) return
    const lenis = new Lenis({ lerp: 0.12 })
    let raf: number
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])
  return <>{children}</>
}
```

- [ ] **Step 2: `marquee.tsx`** — franja infinita CSS (transform loop duplicando contenido), pausable, `aria-hidden` en el duplicado. Props: `{ children, speed?: number, reverse?: boolean }`.

- [ ] **Step 3: `sticky-stack.tsx`** — contenedor sticky con framer-motion `useScroll`: cada card hija se apila escalando la anterior. Props: `{ items: React.ReactNode[] }`. En mobile degrada a scroll normal con reveals si el alto de viewport < 700px.

- [ ] **Step 4: `draw-line.tsx`** — SVG path con `pathLength` animado por `useScroll` del contenedor (`scrollYProgress` → `strokeDashoffset`). Props: `{ className?, orientation: 'vertical' }`.

- [ ] **Step 5: `parallax.tsx`** — wrapper `useScroll`+`useTransform` con `y` proporcional. Props: `{ children, offset?: number }`. Con reduced-motion no traslada.

- [ ] **Step 6: Integrar `LenisProvider` en ambos root layouts** (envuelve `{children}` dentro de RootShell).

- [ ] **Step 7: Verificación**

Run: `npm run check`
Expected: verde. Verificación visual: `npm run dev` → scroll suave en desktop, nativo en mobile (device toolbar).

- [ ] **Step 8: Commit**

```bash
git add src/components/motion/ src/components/layout/root-shell.tsx
git commit -m "feat(motion): primitives scroll-driven (marquee, sticky-stack, draw-line, parallax) + lenis desktop"
```

### Task 7: Header y footer nuevos

**Files:**
- Rewrite: `src/components/layout/site-header.tsx`, `site-header-client.tsx`, `site-footer.tsx`
- Modify: `src/components/layout/whatsapp-fab.tsx` (acepta `locale` y `message` por props)

- [ ] **Step 1: Header** — server component que recibe `locale`, lee dict, renderiza: logo `GALFRE**DEV**` (DEV en `--color-accent`), nav desktop, switcher de idioma, botón ⌘K (icono buscador en mobile), CTA `ctaTalk`. Menú mobile: sheet full-screen con stagger de links (client component). Fondo: blur + borde inferior `--surface-border` al scrollear (hook `useScrollY > 24`).

- [ ] **Step 2: Switcher de idioma** — mapea la ruta actual a su equivalente en el otro locale usando slugs del diccionario:

```tsx
// src/lib/locale-switch.ts
import { getDictionary, localizedPath, serviceByLocalizedSlug, projectByLocalizedSlug } from '@/lib/i18n'
import type { Locale } from '@/types/content'

/** Dada la ruta actual, devuelve la equivalente en el otro idioma (fallback: home). */
export function switchLocalePath(current: Locale, pathname: string): string {
  const target: Locale = current === 'es' ? 'en' : 'es'
  const clean = current === 'en' ? pathname.replace(/^\/en/, '') || '/' : pathname
  const dict = getDictionary(current)
  const tDict = getDictionary(target)
  // servicios y proyectos: matchear por slug localizado y traducir el slug
  const svcMatch = clean.match(/^\/(servicios|services)\/([^/]+)$/)
  if (svcMatch) {
    const svc = serviceByLocalizedSlug(current, svcMatch[2])
    if (svc) return localizedPath(target, `/${target === 'es' ? 'servicios' : 'services'}/${tDict.services[svc.id].slug}`)
  }
  const prjMatch = clean.match(/^\/(proyectos|projects)\/([^/]+)$/)
  if (prjMatch) {
    const prj = projectByLocalizedSlug(current, prjMatch[2])
    if (prj) return localizedPath(target, `/${target === 'es' ? 'proyectos' : 'projects'}/${tDict.projects[prj.id].slug}`)
  }
  const staticMap: Record<string, string> = current === 'es'
    ? { '/': '/', '/proyectos': '/projects', '/sobre-mi': '/about' }
    : { '/': '/', '/projects': '/proyectos', '/about': '/sobre-mi' }
  return localizedPath(target, staticMap[clean] ?? '/')
}
```

Test unitario en `src/lib/locale-switch.test.ts` cubriendo: home, /proyectos↔/projects, servicio con slug distinto por idioma, ruta desconocida → home.

- [ ] **Step 3: Footer** — 3 columnas (marca+tagline, nav, redes de `socialLinks`), marquee sutil superior con `typedWords`, `footer.rights` + `footer.madeIn`.

- [ ] **Step 4: Tests + visual**

Run: `npm run test && npm run check`
Expected: verde. Visual: header sticky con blur, menú mobile abre con stagger, switcher lleva a `/en` y vuelve.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/ src/lib/locale-switch.*
git commit -m "feat(shell): header y footer nuevos con switcher es/en por slug"
```

### Task 8: Command palette ⌘K

**Files:**
- Create: `src/components/command/command-palette.tsx`
- Modify: root layouts (montar el provider), header (botón trigger)
- Create: `e2e/command-palette.spec.ts`

- [ ] **Step 1: Implementar con `cmdk`** — client component global: abre con ⌘K/Ctrl+K o click en el botón del header; grupos `pages` (todas las páginas + servicios + proyectos desde el dict) y `actions` (abrir WhatsApp, cambiar idioma, ir a contacto). Estilo: overlay blur oscuro, panel `--surface-strong`, borde `--surface-border-strong`. Navegación con `useRouter`.

- [ ] **Step 2: e2e `e2e/command-palette.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('⌘K abre la palette y navega a proyectos', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('ControlOrMeta+k')
  const input = page.getByPlaceholder(/buscar/i)
  await expect(input).toBeVisible()
  await input.fill('proyectos')
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/proyectos/)
})
```

(Nota: la ruta `/proyectos` existe recién en Task 22 — hasta entonces la entrada de palette apunta a `/#proyectos`; ajustar el test a esa URL y actualizarlo en Task 22.)

- [ ] **Step 3: Verificar, commit**

```bash
npm run check && npm run test:e2e
git add src/components/command/ e2e/command-palette.spec.ts src/app src/components/layout/
git commit -m "feat(shell): command palette ⌘K con navegación y acciones"
```

---

## Fase 3 — Hero + teclado 3D (LA pieza central)

### Task 9: Hero con teclado CSS (fallback primero) + loop de tipeo compartido

El fallback CSS se construye ANTES que el WebGL: es el placeholder de carga, el fallback permanente de dispositivos flojos y garantiza que el hero nunca dependa del 3D.

**Files:**
- Create: `src/components/hero/use-typing-loop.ts`, `src/components/hero/keyboard-css.tsx`, `src/components/hero/hero-section.tsx` (nuevo, en `hero/`, NO en `sections/`)
- Create: `e2e/hero.spec.ts`
- Modify: `src/app/(es)/page.tsx` (montar hero nuevo arriba de las secciones viejas por ahora)

- [ ] **Step 1: `use-typing-loop.ts`** — la única fuente de verdad del tipeo (la consumen headline, teclado CSS y teclado 3D)

```ts
'use client'
import { useEffect, useRef, useState } from 'react'

export type TypingState = {
  word: string          // palabra objetivo actual (de typedWords)
  typed: string         // porción ya tipeada
  pressedKey: string | null // tecla física "presionada" este tick (para animar)
  wordIndex: number     // índice de la palabra rotativa del titular (sincronizado)
}

const TYPO_RATE = 0.06 // prob. de typo humano que se corrige

export function useTypingLoop(words: string[], opts?: { paused?: boolean }): TypingState {
  const [state, setState] = useState<TypingState>({ word: words[0], typed: '', pressedKey: null, wordIndex: 0 })
  const ref = useRef({ i: 0, pos: 0, phase: 'typing' as 'typing' | 'holding' | 'deleting', typoAt: -1 })
  useEffect(() => {
    if (opts?.paused) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) { setState({ word: words[0], typed: words[0], pressedKey: null, wordIndex: 0 }); return }
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const r = ref.current
      const word = words[r.i % words.length]
      let delay = 90 + Math.random() * 120
      if (r.phase === 'typing') {
        if (r.typoAt === -1 && r.pos > 1 && r.pos < word.length - 1 && Math.random() < TYPO_RATE) {
          // typo: tipea una tecla vecina equivocada y la corrige
          r.typoAt = r.pos
          setState({ word, typed: word.slice(0, r.pos) + '·', pressedKey: '·', wordIndex: r.i % words.length })
        } else if (r.typoAt !== -1) {
          r.typoAt = -1
          setState({ word, typed: word.slice(0, r.pos), pressedKey: 'BACKSPACE', wordIndex: r.i % words.length })
          delay = 180
        } else {
          r.pos += 1
          const ch = word[r.pos - 1]
          setState({ word, typed: word.slice(0, r.pos), pressedKey: ch, wordIndex: r.i % words.length })
          if (r.pos >= word.length) { r.phase = 'holding'; delay = 1600 }
        }
      } else if (r.phase === 'holding') {
        r.phase = 'deleting'; delay = 60
      } else {
        r.pos -= 1
        setState({ word, typed: word.slice(0, r.pos), pressedKey: 'BACKSPACE', wordIndex: r.i % words.length })
        delay = 45
        if (r.pos <= 0) { r.phase = 'typing'; r.i += 1; delay = 500 }
      }
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, 600)
    return () => clearTimeout(timer)
  }, [words, opts?.paused])
  return state
}
```

- [ ] **Step 2: `keyboard-css.tsx`** — port del mockup aprobado (teclado en perspectiva CSS, teclas `--color-accent` que se hunden vía `pressedKey`, flotación keyframes, glow teal). Recibe `{ typing: TypingState }`. Filas de teclas como data local `const ROWS: string[][]` con layout QWERTY simplificado (4 filas + espacio) para poder mapear `pressedKey` → tecla visual.

- [ ] **Step 3: `hero-section.tsx`** — client component: eyebrow, `titlePrefix` + palabra rotativa (`rotatingWords[wordIndex]` con `AnimatePresence` crossfade), sub, CTAs, `<KeyboardCSS typing={typing}/>` centrado y protagonista, línea tipeada `typed` con cursor, marquee de proyectos al pie (nombres desde dict.projects). Layout mobile-first: columna centrada; teclado ocupa el ancho sangrando bordes en mobile.

- [ ] **Step 4: e2e `e2e/hero.spec.ts`**

```ts
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
```

- [ ] **Step 5: Verificar + commit**

```bash
npm run check && npm run test:e2e
git add src/components/hero/ e2e/hero.spec.ts "src/app/(es)/page.tsx" "src/app/(en)/en/page.tsx"
git commit -m "feat(hero): hero nuevo con teclado CSS fallback y loop de tipeo compartido"
```

### Task 10: Teclado WebGL (React Three Fiber)

**Files:**
- Create: `src/components/three/keyboard/layout.ts`, `quality.ts`, `key3d.tsx`, `keyboard-model.tsx`, `keyboard-scene.tsx`
- Create: `src/components/hero/keyboard-hero.tsx` (orquestador fallback↔WebGL)
- Modify: `src/components/hero/hero-section.tsx` (usa KeyboardHero en vez de KeyboardCSS directo)

- [ ] **Step 1: `layout.ts`** — data del teclado (60% compacto, 5 filas)

```ts
export type KeyDef = { id: string; label: string; w: number; row: number; col: number }

const ROWS: [string, number][][] = [
  [['`',1],['1',1],['2',1],['3',1],['4',1],['5',1],['6',1],['7',1],['8',1],['9',1],['0',1],['BACKSPACE',2]],
  [['TAB',1.5],['Q',1],['W',1],['E',1],['R',1],['T',1],['Y',1],['U',1],['I',1],['O',1],['P',1],['·',1.5]],
  [['CAPS',1.8],['A',1],['S',1],['D',1],['F',1],['G',1],['H',1],['J',1],['K',1],['L',1],['ENTER',2.2]],
  [['SHIFT',2.4],['Z',1],['X',1],['C',1],['V',1],['B',1],['N',1],['M',1],[',',1],['SHIFT2',2.6]],
  [['CTRL',1.3],['ALT',1.3],['SPACE',6.5],['FN',1.3],['GD',1.3]],
]

export const KEYS: KeyDef[] = ROWS.flatMap((row, r) => {
  let x = 0
  return row.map(([label, w]) => {
    const def = { id: label, label: label.length > 1 ? '' : label, w, row: r, col: x }
    x += w
    return def
  })
})
export const BOARD_COLS = Math.max(...ROWS.map((r) => r.reduce((a, [, w]) => a + w, 0)))
export const KEY_UNIT = 0.55 // tamaño de 1u en unidades de escena
```

- [ ] **Step 2: `quality.ts`** — detección de tier

```ts
export type GpuTier = 'high' | 'mid' | 'low'

export function detectTier(): GpuTier {
  if (typeof window === 'undefined') return 'low'
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low'
  const canvas = document.createElement('canvas')
  const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
  if (!gl) return 'low'
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 8
  const cores = navigator.hardwareConcurrency ?? 8
  const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent)
  if (memory <= 4 || cores <= 4) return mobile ? 'low' : 'mid'
  return mobile ? 'mid' : 'high'
}
```

- [ ] **Step 3: `key3d.tsx`** — keycap: `RoundedBox` de drei (bisel real), material `meshStandardMaterial` con `emissive` teal (`#2a9184`) e `emissiveIntensity` animada (spring hacia 2.2 al presionarse, decae a 0.35 idle "respirando" con seno global). Press = translateY -0.12 con spring. Legenda: `Text` de drei solo en tier high/mid (una draw call por tecla con texto — solo teclas alfanuméricas).

- [ ] **Step 4: `keyboard-model.tsx`** — carcasa (RoundedBox chato símil aluminio `metalness 0.9 roughness 0.35`, color `#0d1a22`), plancha inferior emisiva (difusión de luz), mapea `KEYS` a `<Key3D>`; recibe `pressedKey` y el reloj para: ripple (teclas vecinas a la presionada suben `emissiveIntensity` con falloff por distancia) y barrido teal→naranja cada ~9s (lerp del emissive color por columna con offset temporal).

- [ ] **Step 5: `keyboard-scene.tsx`** — `<Canvas dpr={[1, tier==='high'?2:1.5]} camera={{position:[0,5.2,6.5],fov:38}}>`: luces (ambient tenue + dos point lights teal/naranja + `Environment preset="city"` de drei para reflejos), `<Float>` de drei (flotación + deriva), grupo con rotación por mouse (`useFrame` lerp hacia puntero) o gyro en mobile (`deviceorientation`, pedir permiso solo tras primer touch), `ContactShadows` de drei debajo, y en tier `high`: `<EffectComposer><Bloom intensity={0.6}/><DepthOfField focusDistance={0.02}/></EffectComposer>`.

- [ ] **Step 6: `keyboard-hero.tsx`** — orquestador:

```tsx
'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { KeyboardCSS } from './keyboard-css'
import { detectTier, type GpuTier } from '@/components/three/keyboard/quality'
import type { TypingState } from './use-typing-loop'

const KeyboardScene = dynamic(
  () => import('@/components/three/keyboard/keyboard-scene').then((m) => m.KeyboardScene),
  { ssr: false },
)

export function KeyboardHero({ typing }: { typing: TypingState }) {
  const [tier, setTier] = useState<GpuTier | null>(null)
  useEffect(() => {
    // diferir la decisión (y el bundle 3D) hasta idle: el LCP es el titular + teclado CSS
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 1200))
    idle(() => setTier(detectTier()))
  }, [])
  const webgl = tier === 'high' || tier === 'mid'
  return (
    <div data-testid="keyboard-hero" className="relative">
      {!webgl && <KeyboardCSS typing={typing} />}
      {webgl && <KeyboardScene typing={typing} tier={tier!} />}
    </div>
  )
}
```

- [ ] **Step 7: Verificación por ejecución** — `npm run dev`: (a) teclado 3D carga tras el CSS sin salto brusco (fade entre ambos), (b) tipea solo sincronizado con el titular, (c) DevTools → Network throttling + `about:blank` WebGL disabled flag → fallback CSS queda. `npm run check` verde.

- [ ] **Step 8: Commit**

```bash
git add src/components/three/ src/components/hero/
git commit -m "feat(teclado): render WebGL R3F con tiers de calidad, ripple de luz y barridos teal-naranja"
```

### Task 11: Interactividad física, sonido y easter egg

**Files:**
- Create: `src/components/hero/use-physical-keys.ts`, `src/components/hero/key-sound.ts`
- Modify: `keyboard-scene.tsx`, `keyboard-css.tsx`, `hero-section.tsx`

- [ ] **Step 1: `use-physical-keys.ts`** — listener global de `keydown`/`keyup` (activo solo con hero en viewport, vía IntersectionObserver): expone `{ liveKey, buffer }`; escribir pausa el auto-tipeo (`useTypingLoop({paused})`) 4s desde la última tecla y lo tipeado aparece en la línea del hero. Ignorar cuando `event.target` es input/textarea/contenteditable (¡el form de contacto no debe animar el teclado!).

- [ ] **Step 2: `key-sound.ts`** — click mecánico sintetizado con WebAudio (oscilador + noise burst + envelope corto, ~40ms; sin assets). Export `playClick()` y `setEnabled(boolean)`. Botón toggle 🔊 discreto bajo el teclado, **apagado por defecto**, estado en `localStorage`.

- [ ] **Step 3: Easter egg** — si `buffer` termina en `galfredev`: barrido arcoíris por todas las teclas (3s) + mensaje en la línea tipeada: `> acceso concedido. sos de los míos.` / `> access granted. you're one of us.` (del dict).

- [ ] **Step 4: Touch en mobile** — tap sobre el canvas dispara una ola de presses desde el punto tocado (raycast a la tecla más cercana).

- [ ] **Step 5: Verificación por ejecución** — dev: escribir "hola" → teclas 3D se hunden + texto aparece; escribir en el form de contacto NO afecta; toggle sonido persiste tras reload; "galfredev" dispara el egg. `npm run check` verde.

- [ ] **Step 6: Commit**

```bash
git add src/components/hero/ src/components/three/
git commit -m "feat(teclado): interactividad física, sonido opcional y easter egg"
```

### Task 12: Salida cinematográfica por scroll + presupuesto de performance

**Files:**
- Modify: `keyboard-scene.tsx`, `hero-section.tsx`
- Create: `e2e/perf.spec.ts`

- [ ] **Step 1: Scroll-link** — en `hero-section`, `useScroll` sobre el contenedor del hero; pasar `scrollProgress` (0→1) a la escena: la cámara sube y se aleja (`lerp` de posición) y el teclado se inclina hacia atrás; opacity del hero copy baja. En CSS fallback: mismo efecto con transform en el wrapper.

- [ ] **Step 2: Pausar render fuera de viewport** — `frameloop="demand"` + invalidate en cada frame SOLO si el canvas está intersectando; al salir del hero, el canvas congela (cero GPU).

- [ ] **Step 3: `e2e/perf.spec.ts`** — presupuesto ejecutable:

```ts
import { test, expect } from '@playwright/test'

test('el hero es visible sin esperar al bundle 3D', async ({ page }) => {
  await page.route('**/*three*', (r) => r.abort()) // simula 3D nunca llega
  await page.goto('/')
  await expect(page.getByText('Software que')).toBeVisible()
  await expect(page.getByTestId('keyboard-hero')).toBeVisible()
})
```

- [ ] **Step 4: Lighthouse manual (gate)**

Run: `npm run build && npm run start -- --port 3200 &` y `npx lighthouse http://localhost:3200 --preset=perf --form-factor=mobile --screenEmulation.mobile --quiet --output=json | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log('PERF', JSON.parse(d).categories.performance.score*100))"`
Expected: `PERF >= 90`. Si no llega: revisar que el 3D esté fuera del critical path, `next/font` sin bloqueo, imágenes con `next/image`.

- [ ] **Step 5: Commit**

```bash
git add src/components/hero/ src/components/three/ e2e/perf.spec.ts
git commit -m "feat(teclado): salida cinematográfica por scroll y presupuesto de perf ejecutable"
```

---

## Fase 4 — Secciones de la home

### Task 13: Servicios + Proceso

**Files:**
- Create: `src/components/sections/services-section.tsx` (nueva), rewrite `process-section.tsx`
- Delete (al final de la task): `solutions-section.tsx`, `hero-section.tsx` viejo, `device-showcase.tsx`, `rotating-text.tsx`, `interactive-panel.tsx` (verificar con grep que nadie los importe antes de borrar)

- [ ] **Step 1: `services-section.tsx`** — server component `{ locale }`: título/sub del dict, 5 cards (una por `ServiceId`) con `StaggerReveal`; card = nombre, hero.sub abreviado, ícono lucide por servicio (`MessageCircle`, `Globe`, `Smartphone`, `Workflow`, `Blocks`), borde glow teal en hover (reusar `border-glow-card.tsx`), link a `localizedPath(locale, '/servicios/'+slug)`. Mobile: carrusel horizontal con scroll-snap; desktop: grid 5 col asimétrica.

- [ ] **Step 2: `process-section.tsx`** — 3 pasos del dict verticales conectados por `<DrawLine>` que se dibuja al scrollear; cada paso revela número grande serif + título + descripción + outcome.

- [ ] **Step 3: Integrar ambas en `(es)/page.tsx` y `(en)/en/page.tsx`, borrar las secciones viejas reemplazadas**

```bash
grep -rn "solutions-section\|device-showcase\|rotating-text\|interactive-panel" src/ # debe dar vacío antes de borrar
```

- [ ] **Step 4: Verificar + commit**

```bash
npm run check && npm run test:e2e
git add -A
git commit -m "feat(home): secciones servicios y proceso con reveals y línea scroll-driven"
```

### Task 14: Proyectos (sticky-stack)

**Files:**
- Create: `src/components/sections/projects-section.tsx`
- Create: `public/images/projects/.gitkeep` + `src/components/ui/project-frame.tsx`

- [ ] **Step 1: `project-frame.tsx`** — marco de dispositivo (browser chrome para SaaS/web, iPhone para Pulso, chat para bot_ime) que envuelve la captura con `next/image`. **Hasta que Valentino entregue capturas** (pendiente humano del spec §11): renderiza un placeholder estilizado con el nombre del proyecto sobre gradiente de marca — mismo componente, `src` opcional.

- [ ] **Step 2: `projects-section.tsx`** — `<StickyStack>` con una card grande por proyecto (orden: pyron, pulso, bot-ime, orbita): tagline, 2 resultados clave, stack como chips, `ProjectFrame`, link a la página del caso. Card con parallax interno en la imagen.

- [ ] **Step 3: Integrar en ambas homes, verificar scroll en mobile (stack degrada a reveals), commit**

```bash
npm run check
git add -A
git commit -m "feat(home): sección proyectos con sticky-stack y marcos de dispositivo"
```

### Task 15: Demo bot (UI, modo guionado)

La UI completa se construye ya con el modo guionado — la API real llega en Fase 5 y solo cambia el transporte.

**Files:**
- Create: `src/components/demos/bot-chat.tsx`, `src/lib/demo-bot-script.ts`
- Create: `src/components/sections/bot-demo-section.tsx`
- Create: `e2e/bot-demo.spec.ts`

- [ ] **Step 1: `demo-bot-script.ts`** — árbol de respuestas guionadas (es/en desde el dict NO — este script es lógica, vive acá con textos por locale):

```ts
import type { Locale } from '@/types/content'

type Rule = { match: RegExp; reply: { es: string; en: string } }

const RULES: Rule[] = [
  { match: /precio|costo|cu[aá]nto|price|cost/i, reply: {
    es: 'Depende del alcance: un bot de WhatsApp arranca más accesible que un sistema a medida. Contame qué necesitás y te paso un rango real por WhatsApp 👉',
    en: 'It depends on scope: a WhatsApp bot starts cheaper than a full custom system. Tell me what you need and I\'ll send you a real range on WhatsApp 👉' } },
  { match: /whatsapp|bot/i, reply: {
    es: 'Armo bots de WhatsApp que atienden consultas, filtran leads y agendan turnos — como este que estás probando. ¿Para qué rubro lo necesitás?',
    en: 'I build WhatsApp bots that answer questions, qualify leads and book appointments — like the one you\'re trying. What industry is it for?' } },
  { match: /web|p[aá]gina|site/i, reply: {
    es: 'Hago webs que venden: rápidas, animadas y con SEO. Esta misma página es la demo 😉 ¿Tenés algo online hoy?',
    en: 'I build websites that sell: fast, animated, SEO-ready. This very site is the demo 😉 Do you have something online today?' } },
  { match: /app|aplicaci[oó]n/i, reply: {
    es: 'Desarrollo apps móviles y sistemas web a medida. Pulso, mi app de iOS, está en el portfolio. ¿Qué tenés en mente?',
    en: 'I build mobile apps and custom web systems. Pulso, my iOS app, is in the portfolio. What do you have in mind?' } },
]

const FALLBACK = {
  es: 'Buena pregunta 👌 Para darte una respuesta en serio, mejor seguimos por WhatsApp — tocá el botón verde y te respondo en el día.',
  en: 'Good question 👌 To answer properly, let\'s continue on WhatsApp — tap the green button and I\'ll reply today.',
}

export function scriptedReply(locale: Locale, userText: string): string {
  return (RULES.find((r) => r.match.test(userText))?.reply ?? FALLBACK)[locale]
}
```

- [ ] **Step 2: `bot-chat.tsx`** — client component: burbujas estilo WhatsApp con estética de marca, typing indicator, **autoplay**: al entrar al viewport reproduce una conversación demo mensaje a mensaje (texts del dict) hasta que el visitante toca el input (autoplay para y el chat es suyo); envía → `sendMessage(text)` prop (inyectada: en esta task siempre `scriptedReply` con delay 800ms); chips de sugerencia («¿Qué hace un bot?», «Precios», «Quiero una web»); CTA fijo a WhatsApp; nota `limitNote`.

- [ ] **Step 3: `bot-demo-section.tsx`** + integración en homes.

- [ ] **Step 4: e2e**

```ts
import { test, expect } from '@playwright/test'

test('el bot demo responde en modo guionado', async ({ page }) => {
  await page.goto('/')
  const input = page.getByPlaceholder(/escribile al bot/i)
  await input.scrollIntoViewIfNeeded()
  await input.fill('cuánto sale un bot de whatsapp?')
  await page.keyboard.press('Enter')
  await expect(page.getByText(/rango real por whatsapp/i)).toBeVisible({ timeout: 5000 })
})
```

- [ ] **Step 5: Verificar + commit**

```bash
npm run check && npm run test:e2e
git add src/components/demos/ src/components/sections/bot-demo-section.tsx src/lib/demo-bot-script.ts e2e/bot-demo.spec.ts
git commit -m "feat(home): demo de bot con autoplay y modo guionado"
```

### Task 16: ROI re-skin + About teaser + Contacto + home ensamblada

**Files:**
- Modify: `roi-calculator.tsx`, `roi-calculator-section.tsx`, `contact-section.tsx` (re-skin a tokens/motion nuevos; lógica intacta), `founder-section.tsx` → reemplazada por `about-teaser-section.tsx`
- Modify: `(es)/page.tsx`, `(en)/en/page.tsx` — orden final de secciones del spec §5
- Delete: `profile-teaser-section.tsx`, `blur-highlight.tsx` si quedaron sin imports

- [ ] **Step 1: Re-skins** — ROI y Contacto: mismas funcionalidades, shells de sección nuevos (heading serif + reveals), inputs con focus teal. `about-teaser-section.tsx`: foto founder existente + `home.about.teaser` + CTA a `/sobre-mi`.

- [ ] **Step 2: Ensamblar home final (ambos locales):** Hero → Servicios → Proyectos → BotDemo → Proceso → ROI → AboutTeaser → Contacto. IDs de ancla: es `#servicios #proyectos #proceso #roi #contacto`, en `#services #projects #process #roi #contact` (los usa el nav del dict).

- [ ] **Step 3: e2e de home completa** — agregar a `e2e/hero.spec.ts`:

```ts
test('la home tiene las 8 secciones en orden', async ({ page }) => {
  await page.goto('/')
  for (const id of ['servicios', 'proyectos', 'proceso', 'roi', 'contacto']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1)
  }
})
```

- [ ] **Step 4: Verificar todo + limpiar muertos + commit**

```bash
grep -rn "profile-teaser\|founder-section\|heroScenarios\|valuePillars" src/ # limpiar restos
npm run check && npm run test:e2e
git add -A
git commit -m "feat(home): home nueva ensamblada completa con ROI y contacto re-skineados"
```

---

## Fase 5 — Bot IA real (Claude)

### Task 17: Rate limit + migración (TDD)

**Files:**
- Create: `data/migrations/2026-07-02_demo-bot.sql`
- Create: `src/lib/demo-bot-limit.ts`, `src/lib/demo-bot-limit.test.ts`

- [ ] **Step 1: Migración**

```sql
-- data/migrations/2026-07-02_demo-bot.sql
create table if not exists public.demo_bot_usage (
  id uuid primary key default gen_random_uuid(),
  visitor_id text not null,
  ip text,
  day date not null default current_date,
  message_count int not null default 0,
  updated_at timestamptz not null default now(),
  unique (visitor_id, day)
);
alter table public.demo_bot_usage enable row level security;
-- sin policies: solo el service role (server) accede
```

Aplicar en Supabase (SQL editor o CLI) y actualizar `data/schema.sql`.

- [ ] **Step 2: Test primero — `demo-bot-limit.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { evaluateLimit, DAILY_LIMIT } from './demo-bot-limit'

describe('evaluateLimit', () => {
  it('permite bajo el límite y reporta restantes', () => {
    expect(evaluateLimit(0)).toEqual({ allowed: true, remaining: DAILY_LIMIT })
    expect(evaluateLimit(DAILY_LIMIT - 1)).toEqual({ allowed: true, remaining: 1 })
  })
  it('bloquea al llegar al límite', () => {
    expect(evaluateLimit(DAILY_LIMIT)).toEqual({ allowed: false, remaining: 0 })
    expect(evaluateLimit(DAILY_LIMIT + 5)).toEqual({ allowed: false, remaining: 0 })
  })
})
```

- [ ] **Step 3: Verificar que falla, implementar**

```ts
// src/lib/demo-bot-limit.ts
export const DAILY_LIMIT = 15

export function evaluateLimit(currentCount: number): { allowed: boolean; remaining: number } {
  const remaining = Math.max(0, DAILY_LIMIT - currentCount)
  return { allowed: remaining > 0, remaining }
}
```

- [ ] **Step 4: Verde + commit**

```bash
npm run test
git add data/ src/lib/demo-bot-limit.*
git commit -m "feat(bot): límite diario del demo bot con migración supabase"
```

### Task 18: API route con Claude + wiring live/fallback

**Files:**
- Create: `src/app/api/demo-bot/route.ts`
- Modify: `src/lib/env.ts` (agregar `anthropicApiKey` opcional), `bot-chat.tsx` (transporte live → fallback)
- Create: `e2e/bot-demo-live.spec.ts`

- [ ] **Step 1: `route.ts`**

```ts
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'
import { evaluateLimit } from '@/lib/demo-bot-limit'
import { scriptedReply } from '@/lib/demo-bot-script'
import type { Locale } from '@/types/content'

const SYSTEM = (locale: Locale) => `Sos el asistente comercial de GalfreDev (Valentino Galfré, Córdoba, Argentina).
Servicios: bots de WhatsApp, webs, apps, automatizaciones e IA, software a medida.
Proyectos reales: Pyron (SaaS gestión matafuegos con facturación AFIP), Pulso (app iOS), bot_ime (bot WhatsApp médico), Órbita (redes con IA).
Objetivo: responder corto (máx 3 oraciones), cálido y concreto, calificar la necesidad del visitante y derivarlo a WhatsApp para cotizar.
No inventes precios exactos. No respondas temas ajenos a GalfreDev: redirigí con simpatía.
Respondé SIEMPRE en ${locale === 'es' ? 'español rioplatense (vos)' : 'English'}.`

export async function POST(req: Request) {
  const { sessionId, locale, messages } = (await req.json()) as {
    sessionId?: string; locale?: Locale; messages?: { role: 'user' | 'assistant'; content: string }[]
  }
  const loc: Locale = locale === 'en' ? 'en' : 'es'
  const lastUser = messages?.filter((m) => m.role === 'user').at(-1)?.content ?? ''
  if (!sessionId || !lastUser || lastUser.length > 500 || (messages?.length ?? 0) > 30) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }
  const scripted = () => NextResponse.json({ reply: scriptedReply(loc, lastUser), mode: 'scripted' as const })
  if (!env.anthropicApiKey || !env.supabaseServiceRoleKey) return scripted()
  try {
    const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
    const { data: row } = await supabase
      .from('demo_bot_usage')
      .upsert({ visitor_id: sessionId, ip, day: new Date().toISOString().slice(0, 10) }, { onConflict: 'visitor_id,day', ignoreDuplicates: false })
      .select('id,message_count').single()
    const { allowed, remaining } = evaluateLimit(row?.message_count ?? 0)
    if (!allowed) return scripted()
    const anthropic = new Anthropic({ apiKey: env.anthropicApiKey })
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: SYSTEM(loc),
      messages: (messages ?? []).slice(-10),
    })
    const reply = res.content.find((b) => b.type === 'text')?.text ?? scriptedReply(loc, lastUser)
    await supabase.from('demo_bot_usage')
      .update({ message_count: (row?.message_count ?? 0) + 1, updated_at: new Date().toISOString() })
      .eq('id', row!.id)
    return NextResponse.json({ reply, mode: 'live' as const, remaining: remaining - 1 })
  } catch {
    return scripted() // la sección nunca se rompe (spec §9)
  }
}
```

(Verificar los nombres exactos de `env.ts` existente — `supabaseUrl`/`supabaseServiceRoleKey` — y ajustar; agregar `anthropicApiKey: process.env.ANTHROPIC_API_KEY` como opcional SIN romper el arranque si falta.)

- [ ] **Step 2: Wire `bot-chat.tsx`** — `sendMessage` ahora hace `fetch('/api/demo-bot')` con `sessionId` (uuid en `localStorage`), locale y el historial; ante `!res.ok` o excepción usa `scriptedReply` local. Mostrar badge sutil «demo en vivo» cuando `mode==='live'`.

- [ ] **Step 3: e2e (sin key en el entorno de test → contrato scripted)**

```ts
import { test, expect } from '@playwright/test'

test('la API responde scripted sin ANTHROPIC_API_KEY', async ({ request }) => {
  const res = await request.post('/api/demo-bot', {
    data: { sessionId: 'e2e-visitor', locale: 'es', messages: [{ role: 'user', content: 'hola, precios?' }] },
  })
  expect(res.status()).toBe(200)
  const body = await res.json()
  expect(body.mode).toBe('scripted')
  expect(body.reply.length).toBeGreaterThan(10)
})
```

- [ ] **Step 4: Verificar + commit**

```bash
npm run check && npm run test:e2e
git add src/app/api/demo-bot/ src/lib/env.ts src/components/demos/bot-chat.tsx e2e/bot-demo-live.spec.ts
git commit -m "feat(bot): API demo-bot con Claude Haiku, rate limit y fallback guionado"
```

---

## Fase 6 — Páginas de servicio + micro-demos

### Task 19: Contenido de los 5 servicios + rutas

**Fact sheets (fuente de verdad para el copy — expandir con la voz de marca en ambos idiomas):**

| id | slug es / en | Hecho clave | Dolor que ataca | Prueba |
|---|---|---|---|---|
| bots-whatsapp | bots-whatsapp / whatsapp-bots | Bots que atienden, filtran leads y agendan 24/7 | Consultas que se enfrían por demora | bot_ime en producción (instituto médico) |
| webs | webs / websites | Webs rápidas, animadas y con SEO que venden | Página vieja o inexistente que no convierte | Este mismo sitio |
| apps | apps / apps | Apps iOS/Android y sistemas web | Operación atada a planillas y papel | Pulso (iOS), Pyron (SaaS) |
| automatizaciones-ia | automatizaciones-ia / ai-automation | Flujos que conectan herramientas + IA aplicada | Doble carga de datos, tareas repetitivas | Órbita (contenido multi-red con IA) |
| software-a-medida | software-a-medida / custom-software | Sistemas completos: backend, panel, facturación | Lo estándar no alcanza para el negocio | Pyron con AFIP real |

**Files:**
- Modify: `src/content/es/index.ts`, `src/content/en/index.ts` (los 5 `ServiceContent` completos por idioma: seo title/description por keyword, hero, 3-4 benefits, demoTitle/demoHint, relatedProjects, whatsappMessage específico)
- Create: `src/app/(es)/servicios/[slug]/page.tsx`, `src/app/(en)/en/services/[slug]/page.tsx`
- Create: `src/components/pages/service-page.tsx` (compartida entre locales)
- Create: `e2e/services.spec.ts`

- [ ] **Step 1: Completar contenido es/en de los 5 servicios** (test de no-vacíos lo valida).

- [ ] **Step 2: `service-page.tsx`** — `{ locale, service }`: hero propio (eyebrow, title+italic serif, sub), slot `<MicroDemo id={service.id}/>` (Task 20/21 — hasta entonces renderiza el placeholder del demo con `demoTitle`), benefits en grid con reveals, proyectos relacionados (cards chicas), CTA WhatsApp con `whatsappMessage`.

- [ ] **Step 3: Rutas** — `[slug]/page.tsx` con `generateStaticParams` desde el dict del locale y `generateMetadata` desde `service.seo`; slug inválido → `notFound()`.

```tsx
// src/app/(es)/servicios/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getDictionary, serviceByLocalizedSlug } from '@/lib/i18n'
import { ServicePage } from '@/components/pages/service-page'
import type { Metadata } from 'next'

export function generateStaticParams() {
  return Object.values(getDictionary('es').services).map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const svc = serviceByLocalizedSlug('es', slug)
  if (!svc) return {}
  return { title: svc.seo.title, description: svc.seo.description, alternates: { canonical: `/servicios/${slug}` } }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const svc = serviceByLocalizedSlug('es', slug)
  if (!svc) notFound()
  return <ServicePage locale="es" service={svc} />
}
```

(La versión en `(en)/en/services/` es idéntica con `'en'`.)

- [ ] **Step 4: e2e**

```ts
import { test, expect } from '@playwright/test'
import { getDictionary } from '../src/lib/i18n'

test('cada servicio es renderiza con su title único', async ({ page }) => {
  for (const svc of Object.values(getDictionary('es').services)) {
    await page.goto(`/servicios/${svc.slug}`)
    await expect(page).toHaveTitle(new RegExp(svc.name, 'i'))
  }
})

test('slug inválido da 404', async ({ page }) => {
  const res = await page.goto('/servicios/no-existe')
  expect(res?.status()).toBe(404)
})
```

- [ ] **Step 5: Verificar + actualizar nav/palette con los slugs reales + commit**

```bash
npm run check && npm run test:e2e
git add -A
git commit -m "feat(servicios): 5 páginas de servicio bilingües con SEO por keyword"
```

### Task 20: Micro-demos 1-3 (whatsapp-sim, web-builder, phone-app)

**Files:**
- Create: `src/components/demos/micro/whatsapp-sim.tsx`, `web-builder.tsx`, `phone-app.tsx`
- Create: `src/components/demos/micro/index.tsx` (`MicroDemo` switch por ServiceId, lazy con `next/dynamic`)

Regla común: client components autocontenidos, estado local, sin red, `data-testid="micro-demo"`, funcionan con teclado y touch, alto máx 480px mobile.

- [ ] **Step 1: `whatsapp-sim.tsx` (código completo — exemplar del patrón)**

```tsx
'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Locale } from '@/types/content'

type Msg = { from: 'user' | 'bot' | 'system'; text: string }

const SCRIPT: Record<string, { es: Msg[]; en: Msg[] }> = {
  turno: {
    es: [
      { from: 'bot', text: '¡Hola! Soy el asistente del consultorio. ¿Querés sacar un turno? 🗓️' },
      { from: 'user', text: 'Sí, para esta semana' },
      { from: 'bot', text: 'Tengo jueves 10:30 o viernes 16:00 con la Dra. Pérez. ¿Cuál te queda mejor?' },
      { from: 'user', text: 'Jueves' },
      { from: 'bot', text: 'Listo ✅ Jueves 10:30. Te mando recordatorio el miércoles. ¿Algo más?' },
      { from: 'system', text: 'Turno agendado · Lead guardado · Recordatorio programado' },
    ],
    en: [ /* misma conversación traducida */ ],
  },
  precio: { /* rama: consulta de precios → filtro + derivación */ es: [], en: [] },
  urgencia: { /* rama: urgencia → prioridad alta + derivación humana */ es: [], en: [] },
}

export function WhatsappSim({ locale }: { locale: Locale }) {
  const [branch, setBranch] = useState<string | null>(null)
  const [step, setStep] = useState(0)
  const msgs = branch ? SCRIPT[branch][locale].slice(0, step + 1) : []
  const done = branch !== null && step >= SCRIPT[branch][locale].length - 1
  const advance = () => branch && setStep((s) => Math.min(s + 1, SCRIPT[branch][locale].length - 1))
  return (
    <div data-testid="micro-demo" className="rounded-3xl border border-[var(--surface-border)] bg-[var(--surface-strong)] p-4">
      {!branch && (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-[var(--text-soft)]">{locale === 'es' ? 'Elegí cómo arranca la conversación:' : 'Pick how the conversation starts:'}</p>
          {Object.keys(SCRIPT).map((k) => (
            <button key={k} onClick={() => { setBranch(k); setStep(0) }} className="rounded-full border border-[var(--surface-border-strong)] px-4 py-2 text-left text-sm hover:bg-[var(--color-panel)]">
              {k === 'turno' ? '🗓️ Quiero un turno' : k === 'precio' ? '💰 ¿Cuánto sale?' : '🚨 Es urgente'}
            </button>
          ))}
        </div>
      )}
      <AnimatePresence>
        {msgs.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={m.from === 'system' ? 'my-2 text-center text-[11px] text-[var(--color-accent)]'
              : `my-1 max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.from === 'user' ? 'ml-auto bg-[var(--color-accent)]/20' : 'bg-white/5'}`}>
            {m.text}
          </motion.div>
        ))}
      </AnimatePresence>
      {branch && !done && (
        <button onClick={advance} className="mt-3 w-full rounded-full bg-[var(--color-accent)] py-2 text-sm font-semibold text-slate-950">
          {locale === 'es' ? 'Siguiente mensaje →' : 'Next message →'}
        </button>
      )}
      {done && (
        <button onClick={() => { setBranch(null); setStep(0) }} className="mt-3 w-full rounded-full border border-[var(--surface-border)] py-2 text-sm">
          {locale === 'es' ? '↺ Probar otra conversación' : '↺ Try another conversation'}
        </button>
      )}
    </div>
  )
}
```

Completar las ramas `precio` y `urgencia` (es/en) con el mismo formato — 5-6 mensajes cada una terminando en `system`.

- [ ] **Step 2: `web-builder.tsx`** — estado `{ built: boolean; palette: 'teal'|'warm'; dark: boolean }`: botón «Construir» dispara ensamblado animado de un mini-sitio (header→hero→cards→footer aparecen en secuencia con springs); toggles de paleta y dark lo re-tematizan en vivo. Muestra contador de "Lighthouse 98" al final.

- [ ] **Step 3: `phone-app.tsx`** — marco iPhone CSS con una mini app de turnos navegable: 3 tabs (Agenda con lista, Nuevo turno con form fake de 2 taps, Perfil), transiciones entre tabs con `AnimatePresence`, botones reales.

- [ ] **Step 4: `index.tsx`** — `MicroDemo({ id, locale })` con `next/dynamic` por demo y skeleton mientras carga. Integrado ya en `service-page.tsx` (Task 19 lo dejó preparado).

- [ ] **Step 5: e2e — agregar a `e2e/services.spec.ts`**

```ts
test('la micro-demo de bots-whatsapp es interactiva', async ({ page }) => {
  await page.goto('/servicios/bots-whatsapp')
  await page.getByText('🗓️ Quiero un turno').click()
  await page.getByText(/siguiente mensaje/i).click()
  await expect(page.getByText(/dra\. pérez/i)).toBeVisible()
})
```

- [ ] **Step 6: Verificar + commit**

```bash
npm run check && npm run test:e2e
git add src/components/demos/micro/ src/components/pages/service-page.tsx e2e/services.spec.ts
git commit -m "feat(demos): micro-demos live de whatsapp, webs y apps"
```

### Task 21: Micro-demos 4-5 (pipeline, panel)

**Files:**
- Create: `src/components/demos/micro/pipeline.tsx`, `panel.tsx`
- Modify: `src/components/demos/micro/index.tsx`

- [ ] **Step 1: `pipeline.tsx`** — nodos SVG (Formulario → IA clasifica → CRM → WhatsApp → Métricas); botón «Disparar automatización» envía un paquete de datos animado (motion path) nodo a nodo, cada nodo se enciende al recibirlo y muestra qué hizo («lead clasificado: prioridad alta»); contador acumulado de procesados; se puede spamear el botón (múltiples paquetes en vuelo).

- [ ] **Step 2: `panel.tsx`** — mini CRUD: tabla de órdenes (3 filas seed) con agregar/editar inline y una barra de stats (total, pendientes, facturado) que recalcula animada con cada cambio; badge «así se siente un sistema a medida».

- [ ] **Step 3: e2e — pipeline dispara y procesa**

```ts
test('la micro-demo de automatizaciones procesa un lead', async ({ page }) => {
  await page.goto('/servicios/automatizaciones-ia')
  await page.getByRole('button', { name: /disparar/i }).click()
  await expect(page.getByText(/procesados: 1/i)).toBeVisible({ timeout: 8000 })
})
```

- [ ] **Step 4: Verificar + commit**

```bash
npm run check && npm run test:e2e
git add src/components/demos/micro/ e2e/services.spec.ts
git commit -m "feat(demos): micro-demos live de automatizaciones y software a medida"
```

---

## Fase 7 — Portfolio + Sobre mí

### Task 22: Contenido de proyectos + rutas

**Fact sheets (datos reales — no inventar métricas):**

- **Pyron** — SaaS de gestión para empresas de matafuegos. Problema: gestión en planillas, trazabilidad regulada. Solución: sistema completo con OTs, facturación AFIP real (Factura C con CAE), etiquetas QR verificables públicamente, bot WhatsApp, PWA con scan+OCR. Stack: Next.js, tRPC, PostgreSQL (Neon), Railway/Vercel, Claude. Resultado: en producción con clientes reales facturando.
- **Pulso** — app iOS de control de suscripciones. Problema: gastos recurrentes invisibles. Solución: tracker nativo bilingüe con recordatorios y diseño premium (Reanimated, gauge líquido). Stack: React Native/Expo, TypeScript. Resultado: lista para App Store, 186 tests verdes.
- **bot_ime** — asistente WhatsApp + panel para instituto médico (Río Tercero). Problema: consultas repetitivas por turnos/estudios desbordan al staff. Solución: bot IA que responde 24/7 (33 profesionales, coseguros) + panel de gestión, deploy Docker 24/7. Stack: Node, Postgres, Redis, Claude Haiku, WhatsApp Cloud API. Resultado: en producción. **⚠️ Nombre público pendiente de OK del cliente — hasta confirmación, name: «Instituto médico (Río Tercero)» y sin logo.**
- **Órbita** — orquestador de redes multi-empresa. Problema: publicar en muchas redes por empresa consume horas. Solución: generación de posts con IA (texto+imagen), fuentes de noticias reales, agenda multi-red. Stack: pnpm monorepo TS, Vercel/Railway, gpt-image. Resultado: live en producción.

**Files:**
- Modify: contenido es/en (los 4 `ProjectContent` completos)
- Create: `src/app/(es)/proyectos/page.tsx` + `[slug]/page.tsx`, `src/app/(en)/en/projects/page.tsx` + `[slug]/page.tsx`
- Create: `src/components/pages/projects-index-page.tsx`, `src/components/pages/project-page.tsx`
- Create: `e2e/projects.spec.ts`

- [ ] **Step 1: Contenido es/en completo** de los 4 proyectos (tests de paridad/no-vacíos validan).

- [ ] **Step 2: `projects-index-page.tsx`** — grilla de cards grandes con `ProjectFrame` + filtro por servicio (chips client-side).

- [ ] **Step 3: `project-page.tsx`** — narrativa problema→solución→stack→resultados con reveals, `ProjectFrame` hero con parallax, chips de stack, servicios relacionados, CTA contacto. Estructura de rutas idéntica al patrón de Task 19 Step 3 (generateStaticParams + generateMetadata + notFound).

- [ ] **Step 4: e2e**

```ts
import { test, expect } from '@playwright/test'

test('grilla de proyectos y páginas de caso', async ({ page }) => {
  await page.goto('/proyectos')
  await expect(page.getByText(/pyron/i).first()).toBeVisible()
  await page.goto('/proyectos/pyron')
  await expect(page).toHaveTitle(/pyron/i)
  await expect(page.getByText(/afip/i).first()).toBeVisible()
})
```

- [ ] **Step 5: Actualizar test de palette de Task 8 a `/proyectos` real. Verificar + commit**

```bash
npm run check && npm run test:e2e
git add -A
git commit -m "feat(proyectos): portfolio con grilla y páginas de caso bilingües"
```

### Task 23: Página Sobre mí

**Files:**
- Modify: contenido es/en (`AboutContent` completo: historia en 3-4 párrafos — UTN FRC, Coderhouse, foco en software aplicado a negocios; stackGroups y certifications migrados del `site-content.ts` viejo)
- Create: `src/app/(es)/sobre-mi/page.tsx`, `src/app/(en)/en/about/page.tsx`, `src/components/pages/about-page.tsx`

- [ ] **Step 1: `about-page.tsx`** — foto founder grande con parallax, historia con reveals por párrafo, stack en chips por grupo, certificaciones (cards con imagen existente en `/images/certificates/`), CTA contacto.

- [ ] **Step 2: Rutas + metadata + e2e simple (title + foto visible). Verificar + commit**

```bash
npm run check && npm run test:e2e
git add -A
git commit -m "feat(sobre-mi): página completa bilingüe con historia, stack y certificaciones"
```

- [ ] **Step 3: Eliminar `src/content/site-content.ts` y `profile-content.ts` si ya nada los importa** (`grep -rn "site-content\|profile-content" src/` debe dar vacío — migrar lo que falte al diccionario antes de borrar). Commit `chore: retirar contenido legacy migrado al diccionario`.

---

## Fase 8 — Espejo /en completo

### Task 24: Verificación integral bilingüe

Las rutas /en ya existen (Tasks 5, 19, 22, 23). Esta task cierra la paridad.

**Files:**
- Create: `e2e/en-mirror.spec.ts`
- Modify: lo que falte para paridad

- [ ] **Step 1: e2e de paridad**

```ts
import { test, expect } from '@playwright/test'
import { getDictionary } from '../src/lib/i18n'

const en = getDictionary('en')

test('todas las páginas en responden 200 con lang=en', async ({ page }) => {
  const paths = [
    '/en', '/en/projects', '/en/about',
    ...Object.values(en.services).map((s) => `/en/services/${s.slug}`),
    ...Object.values(en.projects).map((p) => `/en/projects/${p.slug}`),
  ]
  for (const p of paths) {
    const res = await page.goto(p)
    expect(res?.status(), p).toBe(200)
    expect(await page.getAttribute('html', 'lang'), p).toBe('en')
  }
})

test('el switcher es↔en mantiene la página equivalente', async ({ page }) => {
  await page.goto('/servicios/bots-whatsapp')
  await page.getByRole('link', { name: 'EN' }).click()
  await expect(page).toHaveURL('/en/services/whatsapp-bots')
  await page.getByRole('link', { name: 'ES' }).click()
  await expect(page).toHaveURL('/servicios/bots-whatsapp')
})
```

- [ ] **Step 2: Correr, arreglar lo que falle, commit**

```bash
npm run check && npm run test:e2e
git add -A
git commit -m "test(i18n): paridad completa del espejo /en verificada por e2e"
```

---

## Fase 9 — SEO técnico

### Task 25: Metadata, JSON-LD, sitemap, OG

**Files:**
- Create: `src/lib/seo.ts`, `src/components/seo/json-ld.tsx`
- Modify: `src/app/sitemap.ts`, todos los `generateMetadata` (sumar hreflang), `src/app/opengraph-image.tsx` + crear OG dinámicas en `servicios/[slug]` y `proyectos/[slug]`
- Create: `e2e/seo.spec.ts`

- [ ] **Step 1: `seo.ts`** — helper de alternates hreflang:

```ts
import type { Locale } from '@/types/content'

/** paths equivalentes por locale, SIN prefijo (es. '/servicios/webs' ↔ en '/services/websites') */
export function hreflangAlternates(esPath: string, enPath: string) {
  return {
    languages: {
      'es-AR': esPath,
      en: `/en${enPath === '/' ? '' : enPath}`,
      'x-default': esPath,
    },
  }
}
```

Aplicarlo en cada `generateMetadata` (home, servicios, proyectos, sobre-mi, en ambos locales con canonical propio).

- [ ] **Step 2: `json-ld.tsx`** — componente `<JsonLd data={...}/>` + builders: `professionalServiceSchema(locale)` (el actual enriquecido), `personSchema()`, `serviceSchema(svc, locale)`, `projectSchema(prj, locale)` (`SoftwareApplication`), `breadcrumbSchema(items)`. Montar: global en layouts, específicos en cada página.

- [ ] **Step 3: `sitemap.ts`** — generar desde los diccionarios TODAS las URLs (es + en) con `alternates.languages`; incluir estáticas legales. `robots.ts` sin cambios.

- [ ] **Step 4: OG dinámicas** — `opengraph-image.tsx` en `servicios/[slug]` y `proyectos/[slug]` con `ImageResponse`: fondo azul noche + grilla, nombre grande + tagline + marca (misma estética del OG actual).

- [ ] **Step 5: e2e `e2e/seo.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

test('hreflang presente en home', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute('href', /\/en$/)
})

test('JSON-LD de servicio válido', async ({ page }) => {
  await page.goto('/servicios/bots-whatsapp')
  const raw = await page.locator('script[type="application/ld+json"]').allTextContents()
  const types = raw.map((t) => JSON.parse(t)['@type'])
  expect(types).toContain('Service')
})

test('sitemap incluye es y en', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text()
  expect(xml).toContain('/servicios/bots-whatsapp')
  expect(xml).toContain('/en/services/whatsapp-bots')
})
```

- [ ] **Step 6: Verificar + commit**

```bash
npm run check && npm run test:e2e
git add -A
git commit -m "feat(seo): hreflang, json-ld por tipo, sitemap bilingüe y OG dinámicas"
```

---

## Fase 10 — Re-skin cuentas + QA final

### Task 26: Re-skin login / perfil / dashboard / 404 / error

**Files:**
- Modify: `src/components/auth/login-panel.tsx`, `src/components/profile/*`, `src/app/(es)/{login,perfil,dashboard}/page.tsx`, `(es)/not-found.tsx`, `(es)/error.tsx`
- Create: `src/app/(en)/en/not-found.tsx` (usa dict en)

- [ ] **Step 1:** Aplicar shell nuevo (header/footer nuevos, headings serif, inputs focus teal, botones pill) SIN tocar lógica de auth ni flujos. 404: titular `notFound.title` + mini teclado CSS decorativo + CTA `notFound.back`.

- [ ] **Step 2:** Verificar login → perfil manualmente con cuenta de prueba (flujo Google intacto). `npm run check && npm run test:e2e` (baseline sigue verde).

- [ ] **Step 3: Commit** `feat(cuentas): re-skin de login, perfil, dashboard y páginas de error`

### Task 27: QA final integral y gates de release

- [ ] **Step 1: Matriz responsive** — con Playwright manual o browser: 360, 390, 768, 1280, 1920px en home, un servicio, un proyecto, sobre-mi (es y en). Sin overflow horizontal (`document.documentElement.scrollWidth <= innerWidth`), teclado protagonista en todas.

- [ ] **Step 2: Reduced motion** — emular `prefers-reduced-motion` en DevTools: la home queda estática y digna (palabra fija, teclado CSS sin flotar, reveals instantáneos).

- [ ] **Step 3: Suite completa contra build de producción**

```bash
npm run check
npm run build && (npm run start -- --port 3100 &) && sleep 5 && npm run test:e2e && kill %1
```

Expected: todo verde contra producción real.

- [ ] **Step 4: Lighthouse mobile final** (mismo comando de Task 12 Step 4). Expected: `PERF >= 90`, SEO >= 95.

- [ ] **Step 5: Limpieza final** — `grep -rn "heroMetrics\|heroScenarios\|solutions\b" src/` sin restos; `npx tsc --noEmit` limpio; borrar componentes muertos restantes.

- [ ] **Step 6: Actualizar `README.md`** (arquitectura nueva: diccionarios, route groups, teclado, demos) y `docs/qa-release-checklist.md`.

- [ ] **Step 7: Commit final + push**

```bash
git add -A
git commit -m "feat: rediseño completo GalfreDev — teclado 3D, multi-página bilingüe, demos live, SEO"
git push origin main
```

- [ ] **Step 8: Recordar pendientes humanos a Valentino** (spec §11): capturas reales → `public/images/projects/` (reemplazan placeholders de ProjectFrame sin tocar código), OK de bot_ime, `ANTHROPIC_API_KEY` en Vercel, revisión del copy en inglés.

---

## Self-review (hecho al escribir el plan)

- **Cobertura del spec:** §3 identidad/motion → Tasks 6-16; §4 teclado → 9-12; §5 mapa/páginas → 5, 13-16, 19-24; §6 innovaciones → 8 (⌘K), 11 (teclado interactivo), 15+18 (bot), 20-21 (micro-demos); §7 arquitectura → 3-5; §8 SEO → 19 (metadata por página) + 25; §9 degradación → 10 (fallback), 18 (scripted), 12 (LCP); §10 verificación → 2, tests por task, 27; §11 pendientes → 14 (placeholders), 22 (bot_ime anonimizado por defecto), 27.8.
- **Riesgo conocido:** multiple root layouts + `not-found` raíz (Task 5 Step 3 tiene el fallback documentado); nombres exactos de `env.ts` (Task 18 lo señala para verificar por lectura).
- **Consistencia de tipos:** `TypingState`, `Dictionary`, `GpuTier`, firmas de `localizedPath`/`switchLocalePath` usadas consistentemente en tasks posteriores.
