# Rediseño completo GalfreDev — Spec de diseño

**Fecha:** 2026-07-02
**Estado:** aprobado por Valentino (brainstorming con companion visual)
**Repo:** `galfredev-web` (Next.js 16, React 19, Tailwind v4, Framer Motion 12, Supabase)

## 1. Objetivo

Rediseñar por completo galfredev.com como carta de presentación de la marca GalfreDev:
desarrollo de software integral (webs, apps, bots de WhatsApp/redes, automatizaciones,
IA aplicada, software a medida). La página debe ser profesional, súper animada,
demostrar capacidad técnica por sí misma y **vender servicios**.

**Reglas duras:**

1. **Mobile-first.** La experiencia en celular es la prioridad número uno y debe ser
   perfecta; desktop igual de impactante pero se diseña desde mobile.
2. Funciona impecable en notebook, desktop, Mac, Windows, iOS y Android.
3. El **teclado 3D es LA pieza central del sitio** y destaca sobre todo lo demás.
4. SEO técnico de primer nivel sin sacrificar animación.

## 2. Decisiones tomadas (con Valentino, 2026-07-02)

| Tema | Decisión |
|---|---|
| Posicionamiento | Marca personal amplia: GalfreDev hace software de punta a punta. Las soluciones PyME quedan como parte de la oferta, no como único mensaje. |
| Portfolio | Casos reales con nombre: **Pyron, Pulso, bot_ime, Órbita**. |
| Alcance conservado | Embudo WhatsApp + leads (Supabase), calculadora ROI, login/perfil/dashboard — todo re-skineado. `/pulso/privacidad`, `/privacidad`, `/terminos` intactos. |
| Estructura | **Multi-página**: home + 5 páginas de servicio + portfolio con páginas por caso + /sobre-mi. |
| Idioma | **Bilingüe es/en** desde el día uno. Español en la raíz (URLs actuales intactas), inglés bajo `/en`, con `hreflang`. |
| Paleta | **La actual de la marca**: azul noche `#050810`, teal `#1f7f73`/`#2a9184` (glow `#3dddc4`), naranja cálido `#ffb46a`. Tipografías Sora + Instrument Serif se mantienen. |
| Titular hero | «Software que **no duerme.**» (itálica serif con degradé teal; la palabra itálica rota re-tipeándose: «no duerme» → «vende por vos» → «atiende 24/7»). |
| Innovaciones | Las 4: demo bot IA en vivo, teclado 3D interactivo, command palette ⌘K, micro-demos live por servicio. |
| Dirección visual | Rechazados los 4 conceptos iniciales genéricos; aprobada la V3: oscuro premium continuista del sitio actual + teclado 3D protagonista centrado con titular arriba. |

## 3. Identidad visual y lenguaje de motion

- Base azul noche con la grilla sutil existente; acento teal para interacción y glow,
  naranja cálido como color de énfasis secundario (nunca compiten: teal domina).
- Sora para UI/titulares pesados; Instrument Serif itálica para las palabras display.
- **Motion scroll-driven en todas las secciones**, cada una con firma propia:
  reveals en cascada (servicios), sticky-stack de cards (proyectos), línea que se
  dibuja con el scroll (proceso), marquees (hero/footer), parallax suave en imágenes,
  micro-interacciones en todo elemento clickeable.
- Smooth scroll con **Lenis solo en desktop**; en mobile scroll nativo.
- Todo respeta `prefers-reduced-motion` (variante estática digna, no rota).
- El resto de la página mantiene intensidad visual contenida para que el teclado
  del hero destaque sobre todo lo demás.

## 4. El teclado 3D (pieza central del sitio)

Render WebGL con **React Three Fiber + drei**, construido paramétricamente
(instancias, sin GLTF pesados). Presupuesto de calidad máximo del proyecto.

**Modelado:** keycaps individuales con perfil biselado y legendas que brillan,
carcasa símil aluminio con cantos pulidos, difusión de luz bajo las teclas.

**Iluminación:** backlight teal que respira en idle; **ripple** de luz expandiéndose
desde cada tecla presionada; barridos teal→naranja tipo RGB premium; environment map
para reflejos metálicos; sombra de contacto suave debajo (flota).

**Animación:** flotación con deriva lenta; **se tipea solo** en loop con recorrido de
tecla realista escribiendo lo que GalfreDev construye (sincronizado con la palabra
rotativa del titular), incluyendo ocasionalmente un "typo" que borra y corrige;
cámara con parallax al mouse (desktop) y gyro/touch (mobile); al scrollear, el
teclado se inclina y aleja cinematográficamente (scroll-linked) para dar paso al
resto de la home.

**Interacción:** el teclado físico del visitante replica en el 3D tecla por tecla y
lo tipeado aparece en pantalla; sonido mecánico de clicks **opcional y apagado por
defecto**; easter egg al escribir palabras clave.

**Tiers de rendimiento (auto-detección):**

- Alta: todo + postprocesado (bloom, DOF).
- Media: sin postprocesado.
- Baja / sin WebGL / reduced-motion: **fallback CSS 3D** (teclas que se hunden con
  keyframes, como el mockup aprobado).

**Regla de carga:** el bundle 3D entra por `next/dynamic` (ssr:false) tras el idle;
el fallback CSS se renderiza instantáneo como placeholder. **El LCP nunca depende
del WebGL.** Lighthouse mobile ≥ 90 en home es gate de release.

## 5. Mapa del sitio y páginas

```
/                                    Home (es, raíz — URLs actuales se preservan)
/servicios/bots-whatsapp             + micro-demo live: chat simulado jugable
/servicios/webs                      + micro-demo live: sitio que se construye y se manipula
/servicios/apps                      + micro-demo live: teléfono interactivo navegable
/servicios/automatizaciones-ia       + micro-demo live: pipeline que el visitante dispara
/servicios/software-a-medida         + micro-demo live: mini panel con datos editables
/proyectos                           grilla completa
/proyectos/{pyron,pulso,bot-ime,orbita}
/sobre-mi                            historia, stack, certificaciones (reemplaza sección fundador)
/en/...                              todo el sitio espejado en inglés
/login /perfil /dashboard            se mantienen, re-skineados
/privacidad /terminos /pulso/privacidad   intactos
```

**Home (8 secciones, orden aprobado):**

1. **Hero** — teclado 3D + titular + CTAs (Empezar un proyecto / Ver proyectos) + marquee de proyectos.
2. **Servicios** — 5 cards con reveal en cascada, cada una → su página.
3. **Proyectos** — sticky-stack de cards grandes con captura real.
4. **Demo bot IA** — chat en vivo; mensajes se escriben solos hasta que el visitante interactúa.
5. **Proceso** — 3 pasos con línea que se dibuja.
6. **Calculadora ROI** — rediseñada a la nueva estética.
7. **Sobre mí** — teaser → /sobre-mi.
8. **Contacto** — form de leads + WhatsApp + redes.

Persistentes: FAB de WhatsApp, ⌘K palette, header con switcher ES/EN.

**Páginas de servicio:** hero propio + micro-demo live + beneficios + casos
relacionados + CTA a WhatsApp con mensaje prearmado por servicio.

**Páginas de proyecto:** problema → solución → stack → resultado, con capturas
reales enmarcadas en mockups de dispositivo.

## 6. Innovaciones

**Demo bot IA en vivo (home):** API route (`/api/demo-bot`) con Claude Haiku
(`claude-haiku-4-5`); system prompt: asistente comercial de GalfreDev que responde
sobre servicios, filtra el lead y deriva a WhatsApp; captura el lead en Supabase.
Límite de mensajes por visitante (cookie de ID anónimo + IP como respaldo,
~15 mensajes/día) persistido en Supabase. **Modo guionado de fallback** (respuestas predefinidas con la misma UI) si falta `ANTHROPIC_API_KEY`,
se excede el límite o la API falla — la sección nunca se rompe ni muestra error crudo.

**Micro-demos live por servicio:** funcionales e interactivas (el visitante las usa),
no videos ni animaciones pasivas. Client components autocontenidos, sin backend
(estado local + datos de ejemplo), lazy-loaded.

**⌘K command palette:** librería `cmdk`. Saltar a páginas/secciones, cambiar idioma,
abrir WhatsApp. En mobile: botón buscador en el header.

## 7. Arquitectura técnica

- **Contenido centralizado y tipado por idioma**: evolución de `site-content.ts` a
  `src/content/{es,en}/…` con tipos compartidos en `src/types/site.ts`. Todo el copy
  (páginas, SEO, demos) sale de ahí; nada hardcodeado en componentes.
- **i18n sin librería pesada**: segmento raíz es (default, sin prefijo) + `/en/*`.
  Helper `getDictionary(locale)`; los componentes reciben contenido por props.
- **3D**: `three` + `@react-three/fiber` + `@react-three/drei`
  (+ `@react-three/postprocessing` solo tier alto). Nuevas deps.
- **Motion**: framer-motion 12 (ya presente) + `lenis` (desktop). Nueva dep.
- **Palette**: `cmdk`. Nueva dep.
- **Supabase**: esquema de leads existente se mantiene; se agrega tabla para
  rate-limit/conversaciones del demo bot (migración en `data/migrations/`).
- **Estructura de componentes**: `sections/` por página, `motion/` primitives
  reutilizables, `three/` para el teclado (aislado tras un boundary dinámico),
  `demos/` para micro-demos. Server components por defecto; client solo donde
  hay interacción.

## 8. SEO técnico

- `generateMetadata` por página desde el contenido; titles/descriptions por keyword
  («bot whatsapp córdoba», «desarrollo de apps a medida», etc.).
- JSON-LD: `ProfessionalService` + `Person` (global), `Service` (servicios),
  `SoftwareApplication`/`CreativeWork` (proyectos), `BreadcrumbList`.
- `hreflang` es/en + canonicals; sitemap con todas las rutas nuevas; OG image
  dinámica por página; robots y Vercel Analytics/Speed Insights se mantienen.
- Todo el contenido SEO-crítico se renderiza server-side (las animaciones lo
  revelan, nunca lo insertan).

## 9. Manejo de errores y degradación

- WebGL falla o no existe → fallback CSS 3D silencioso.
- Demo bot: sin key / rate-limited / error de API → modo guionado.
- JS deshabilitado / crawler: contenido completo server-rendered visible.
- Error boundary global existente se mantiene.

## 10. Verificación (criterios ejecutables)

- `npm run check` (lint + typecheck + build) verde — gate en cada fase.
- **Playwright** (nuevo) con smoke tests de contratos:
  - Home renderiza hero con titular y CTAs (es y en).
  - Switch de idioma navega a `/en` y el contenido cambia.
  - Form de leads envía y persiste (contra Supabase local/mock).
  - Demo bot responde en modo guionado sin API key.
  - ⌘K abre y navega.
  - Cada página de servicio y proyecto renderiza con su `<title>` único.
  - `/pulso/privacidad` sigue intacta.
- **Lighthouse mobile ≥ 90 performance en home** (gate manual pre-deploy).
- QA visual responsive: 360px, 390px, 768px, 1280px, 1920px.

## 11. Acciones humanas pendientes (no bloquean el arranque)

1. **Capturas de proyectos**: Pyron (panel + etiquetas QR), Pulso (screens iPhone),
   bot_ime (chat + panel), Órbita (posts generados). Carpeta destino:
   `public/images/projects/`.
2. **Permiso del cliente para nombrar bot_ime/IME** — si no llega, se publica
   anonimizado como «instituto médico».
3. **`ANTHROPIC_API_KEY` en Vercel** para el demo bot (mientras tanto, modo guionado).
4. Revisión final del copy en inglés.

## 12. Fuera de alcance

- Blog/contenido editorial (fase futura).
- Migrar el dashboard a funcionalidad nueva (solo re-skin).
- App móvil o PWA.
- Cambios de dominio o hosting (sigue Vercel).
