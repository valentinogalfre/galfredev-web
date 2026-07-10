<p align="center">
  <img src=".github/assets/banner.png" alt="GalfreDev" width="100%" />
</p>

<h1 align="center">GalfreDev Web</h1>

<p align="center">
  Sitio comercial bilingüe (es/en) de servicios de automatización, software a medida e IA aplicada a negocios.<br/>
  Hero con teclado 3D, micro-demos interactivas por servicio, bot de demo con Claude y SEO técnico completo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" />
  <img src="https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Three.js-R3F-000000?style=flat-square&logo=three.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-Auth_+_DB-3ecf8e?style=flat-square&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-Deploy-black?style=flat-square&logo=vercel" />
</p>

---

## Objetivo

Sitio web comercial de [GalfreDev](https://galfredev.com) orientado a:

- Presentar la propuesta de valor con foco en resultados concretos para negocios
- Mostrar cada servicio con una micro-demo interactiva (no solo copy)
- Derivar la conversación a WhatsApp o al bot de demo con IA
- Capturar leads con validación, sanitización y consentimiento explícito
- Posicionar en ambos idiomas con SEO técnico (hreflang, JSON-LD, OG por página)

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, route groups por idioma) |
| UI | React 19 + Tailwind CSS v4 |
| Animaciones | Framer Motion v12 + Lenis (scroll suave) |
| 3D | three.js + React Three Fiber + drei + postprocessing |
| Bot de demo | Claude (`@anthropic-ai/sdk`) con fallback guionado |
| Command palette | cmdk (⌘K) |
| Auth + DB | Supabase (SSR) |
| Tipado | TypeScript 5 (strict) |
| Tests | Vitest (unit) + Playwright (e2e, proyectos mobile+desktop) |
| Analítica | Vercel Analytics + Speed Insights |
| Deploy | Vercel |

---

## Arquitectura

### Rutas bilingües por route groups

```
src/app/
├── (es)/                  # Español en la raíz: /, /servicios/[slug], /proyectos,
│   │                      # /proyectos/[slug], /sobre-mi, /login, /perfil, /dashboard…
├── (en)/en/               # Espejo inglés: /en, /en/services/[slug], /en/projects,
│   │                      # /en/projects/[slug], /en/about (+ [...rest] → 404 localizado)
├── api/
│   ├── demo-bot/          # Bot de demo: Claude + límite diario por sesión + fallback guionado
│   ├── lead/              # Captación de leads (origin check, sanitización, consents)
│   └── profile/           # Actualización de perfil autenticado
├── sitemap.ts             # Sitemap bilingüe (excluye rutas privadas)
├── robots.ts
└── opengraph-image.tsx    # OG dinámica global (cada servicio/proyecto tiene la suya por slug)
```

Los slugs es↔en se mapean en `src/lib/route-pairs.ts` (hreflang y switch de idioma
salen de ahí — una sola fuente de verdad).

### Contenido: diccionarios tipados

Todo el copy vive en `src/content/es` y `src/content/en`, tipado por el contrato
`Dictionary` de `src/types/content.ts`. Agregar un idioma = agregar un diccionario
que compile; si falta una clave, no compila.

### Hero: teclado 3D con tiers de GPU

`src/components/three/keyboard/` — escena WebGL (React Three Fiber) que se monta
en forma diferida sobre un teclado CSS aprobado como fallback:

- `quality.ts` detecta el tier de GPU (`low` nunca monta canvas; `mid`/`high`
  ajustan DPR y postprocessing — Bloom solo en `high`).
- El canvas usa `frameloop="demand"` con un driver de rAF que **se cancela fuera
  de viewport** (GPU en cero al scrollear) y con `prefers-reduced-motion` no se
  monta: queda el teclado CSS estático con la palabra fija.
- Assets: `public/hdr/city.hdr` (environment) y `public/fonts/sora-600.ttf`
  (keycaps 3D). Si el 3D no llega o el contexto WebGL muere, el CSS queda.

### Micro-demos por servicio

`src/components/demos/micro/` — cada página de servicio incluye una demo
interactiva propia (simulador de WhatsApp, builder de webs, app de turnos,
pipeline de automatización, panel de software a medida), cargadas con
`next/dynamic` desde `loader.tsx`.

### Bot de demo con Claude

`src/app/api/demo-bot/route.ts`:

- Con `ANTHROPIC_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY`: respuestas reales de
  Claude con límite diario por sesión de visitante (persistido en Supabase,
  migración `data/migrations/2026-07-04_demo-bot.sql`).
- Sin keys: modo guionado (`src/lib/demo-bot-script.ts`) — el chat del home
  funciona igual, con respuestas predefinidas. El contrato es «siempre 200 con
  `{reply, mode}`», y el front degrada solo si la API no está.

### SEO

- `hreflang` es↔en + `x-default` en toda página espejada (`src/lib/seo.ts`).
- JSON-LD por tipo: `Service` en servicios, `SoftwareApplication` en casos,
  `BreadcrumbList` en ambas, `Person`/`WebSite` en home/sobre-mí.
- OG images dinámicas por slug (`opengraph-image.tsx` por ruta, placa común en
  `src/lib/og-card.tsx`).
- Sitemap bilingüe completo sin rutas privadas.

---

## Desarrollo local

```bash
git clone https://github.com/galfredev/galfredev-web.git
cd galfredev-web
npm install
cp .env.example .env.local   # completar credenciales
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

```env
# Requeridas (Supabase + sitio)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_WHATSAPP_URL=

# Opcionales — activan el bot de demo con IA real (sin ellas: modo guionado)
ANTHROPIC_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

> `NEXT_PUBLIC_SUPABASE_ANON_KEY` funciona como fallback si usás el naming
> anterior de Supabase. Las dos opcionales son solo de servidor: nunca van con
> prefijo `NEXT_PUBLIC_`.

---

## Scripts

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción local
npm run lint         # ESLint
npm run typecheck    # TypeScript sin compilar
npm run test         # Vitest (unit)
npm run test:e2e     # Playwright (levanta dev server en :3100; reusa uno existente)
npm run check        # lint + typecheck + test + build (antes de deployar)
```

Para correr la suite e2e contra un build real (gate de release):

```bash
npm run build
npm run start -- --port 3100 &
npx playwright test --retries=0
```

---

## Base de datos (Supabase)

| Tabla | Descripción |
|---|---|
| `profiles` | Datos básicos del usuario autenticado |
| `user_preferences` | Contexto de negocio, necesidades e intereses |
| `lead_intake` | Leads capturados desde el formulario de contacto |
| `lead_events` | Eventos de seguimiento comercial |
| `marketing_consents` | Consentimientos explícitos |
| `demo_bot_sessions` | Límite diario del bot de demo por sesión de visitante |

Esquema base en [`data/schema.sql`](./data/schema.sql); migraciones
incrementales en [`data/migrations`](./data/migrations).

---

## Pendientes para activar

Cosas que requieren acción humana fuera del repo:

1. **Capturas de proyectos** — subir imágenes reales a
   `public/images/projects/` (hoy los casos usan mockups CSS como placeholder).
2. **Migración del bot** — aplicar
   [`data/migrations/2026-07-04_demo-bot.sql`](./data/migrations/2026-07-04_demo-bot.sql)
   en Supabase (crea la tabla de sesiones del bot con su límite diario).
3. **Keys en Vercel** — cargar `ANTHROPIC_API_KEY` y
   `SUPABASE_SERVICE_ROLE_KEY` en el dashboard para pasar el bot de guionado a
   Claude real.

---

## Deploy en Vercel

1. Conectar el repo en [vercel.com](https://vercel.com)
2. Configurar las variables de entorno en el dashboard
3. Verificar los providers OAuth en Supabase (Google, GitHub)
4. Correr `npm run check` localmente antes del merge a `main`
5. Aplicar migraciones SQL pendientes si corresponde
6. Pasar el checklist de [`docs/qa-release-checklist.md`](./docs/qa-release-checklist.md)

---

## Notas de mantenimiento

- **Copy bilingüe:** [`src/content/es`](./src/content/es) / [`src/content/en`](./src/content/en) (contrato en [`src/types/content.ts`](./src/types/content.ts))
- **Mapa de rutas es↔en:** [`src/lib/route-pairs.ts`](./src/lib/route-pairs.ts)
- **SEO (hreflang/JSON-LD/OG):** [`src/lib/seo.ts`](./src/lib/seo.ts) y [`src/lib/og-card.tsx`](./src/lib/og-card.tsx)
- **Modelo de leads:** [`src/lib/lead-model.ts`](./src/lib/lead-model.ts)
- **Validaciones:** [`src/lib/contact.ts`](./src/lib/contact.ts) y [`src/lib/profile.ts`](./src/lib/profile.ts)
- **Seguridad de API:** [`src/lib/security.ts`](./src/lib/security.ts) — origin check, sanitización
- **Bot de demo:** [`src/lib/demo-bot-script.ts`](./src/lib/demo-bot-script.ts) (guion) y [`src/lib/demo-bot-limit.ts`](./src/lib/demo-bot-limit.ts) (límite)

---

<p align="center">
  Hecho con criterio técnico en Córdoba, Argentina · <a href="https://galfredev.com">galfredev.com</a>
</p>
