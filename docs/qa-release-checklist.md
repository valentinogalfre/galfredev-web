# QA Release Checklist

Checklist manual para validar la web de GalfreDev antes de cerrar release, abrir PR final o promover un deploy como principal. Complementa (no reemplaza) los gates automáticos: `npm run check` + suite e2e contra build de producción.

## URLs a testear

- Preview/producción de esta rama: [https://galfre-dev-next.vercel.app](https://galfre-dev-next.vercel.app)
- Dominio actual en producción: [https://galfredev.com](https://galfredev.com)

## 1. Smoke general

- [ ] La home carga completa sin pantalla blanca ni errores visibles.
- [ ] No aparecen errores de hidratación ni overlays rojos en consola.
- [ ] Header, hero con teclado, footer y FAB de WhatsApp renderizan bien.
- [ ] Recargar la home varias veces no rompe layout ni animaciones.
- [ ] Las rutas `/login`, `/privacidad`, `/terminos` y un 404 cargan correctamente.
- [ ] `/en` y una ruta interna en inglés (`/en/services/whatsapp-bots`) cargan completas.

## 2. Hero y teclado 3D

- [ ] Una sola materialización del teclado: en tier mid/high se ve el aura teal respirando y el 3D entra directo (el teclado CSS NUNCA aparece de puente); en tier low el CSS hace fade-in inmediato.
- [ ] Al presionar una tecla (física o click) la luz del glow/bloom muere en fade elíptico — no se lee ningún borde recto del canvas.
- [ ] El loop de tipeo escribe palabras en el teclado y en la línea tipeada.
- [ ] **Device real iOS (Safari):** el teclado 3D carga, no recalienta, y el scroll de salida es fluido.
- [ ] **Device real Android (Chrome):** ídem — en gama baja debe quedar el teclado CSS (tier `low`), no un canvas trabado.
- [ ] Con "Reducir movimiento" activado en el sistema: hero estático completo, palabra fija, sin canvas.
- [ ] Al scrollear lejos del hero, la GPU baja a reposo (verificable en dev tools → performance).
- [ ] El parallax al mouse (desktop) es sutil; el tap en mobile dispara la onda en el teclado.

## 3. Navegación, ⌘K e idiomas

- [ ] Cada item del navbar lleva a la sección/página correcta.
- [ ] El menú mobile abre, cierra y se puede cerrar con `Escape`.
- [ ] La command palette abre con `⌘K` / `Ctrl+K` y desde el botón; navega a páginas y secciones.
- [ ] El switch ES/EN mantiene la página equivalente (servicio ↔ service, proyecto ↔ project).
- [ ] Los links del footer funcionan también desde páginas internas.
- [ ] El botón de acceso/perfil lleva al flujo correcto según sesión.

## 4. Páginas de servicio y micro-demos

- [ ] Las 5 páginas de servicio cargan con su hero, precios/beneficios y CTA.
- [ ] Cada micro-demo (WhatsApp, web builder, app de turnos, pipeline, panel) es interactiva y no rompe layout.
- [ ] Las micro-demos aguantan clicks repetidos/simultáneos sin romperse.
- [ ] El espejo `/en/services/*` muestra las mismas demos con copy en inglés.

## 5. Bot de demo (home)

- [ ] El chat responde en modo guionado sin keys configuradas.
- [ ] **Post-activación de keys** (`ANTHROPIC_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` en Vercel): el bot responde con Claude real (`mode: "live"`), respeta el límite diario y degrada a guionado al agotarlo.
- [ ] El CTA "Seguir por WhatsApp" abre wa.me con el mensaje correcto.

## 6. Portfolio y sobre-mí

- [ ] `/proyectos` filtra por categoría sin glitches.
- [ ] Cada caso (`/proyectos/pyron`, `/proyectos/pulso`, …) carga completo con métricas y stack.
- [ ] `/sobre-mi` (y `/en/about`) cargan historia, stack y certificaciones.

## 7. Responsive

- [ ] Desktop grande (`1920px`) equilibrado y sin vacíos raros.
- [ ] Laptop (`1280px`) mantiene proporciones correctas.
- [ ] Tablet (`768px`) no rompe cards, grids ni demos.
- [ ] Mobile (`360–390px`) legible, CTAs accesibles y **cero scroll horizontal**.

## 8. Formularios y leads

- [ ] El formulario no permite envío vacío; errores claros por campo.
- [ ] Campos largos o raros no rompen UI.
- [ ] El botón de envío se desactiva durante loading.
- [ ] Un envío válido muestra éxito y continúa a WhatsApp.
- [ ] Si falla red/backend, el usuario ve un mensaje claro y seguro.
- [ ] En iPhone: enfocar los inputs NO hace zoom automático (fuente ≥16px).

## 9. Login, auth y perfil

- [ ] `/perfil` redirige a `/login` sin sesión; `/login` redirige con sesión.
- [ ] Magic link acepta email válido y rechaza inválido.
- [ ] OAuth (Google/GitHub) inicia correctamente si está configurado.
- [ ] Logout cierra sesión y vuelve a login.
- [ ] Guardar perfil y subir avatar funcionan; errores bien ubicados.

## 10. SEO y accesibilidad

- [ ] Título y meta description correctos por página (es y en).
- [ ] Un solo `h1` por página.
- [ ] `robots.txt` y `sitemap.xml` responden; el sitemap incluye ambas variantes de idioma y ninguna ruta privada.
- [ ] **OG images:** validar home + un servicio + un proyecto en el validador de Twitter/X ([cards-dev](https://cards-dev.twitter.com/validator)) y el de Facebook ([sharing debugger](https://developers.facebook.com/tools/debug/)) — placa correcta por página, sin 404.
- [ ] **hreflang:** tras el deploy, verificar en Google Search Console (Indexación → Páginas) que las variantes es/en se reconocen como alternates y no como duplicados.
- [ ] El skip link aparece al navegar con teclado y tiene contraste legible.
- [ ] Botones, enlaces e inputs muestran foco visible.
- [ ] Lighthouse mobile: Performance ≥90 en home, SEO ≥95, Accessibility ≥95.

## 11. Seguridad y robustez

- [ ] Los errores visibles no exponen detalles técnicos.
- [ ] No se ve contenido privado ni un instante sin sesión.
- [ ] No hay redirects raros en login/logout/callback.
- [ ] Las páginas públicas renderizan aunque falten variables opcionales (bot en guionado).

## 12. Datos y base

- [ ] `lead_intake` recibe leads; `marketing_consents` registra consentimientos.
- [ ] `profiles` y `user_preferences` guardan cambios del perfil.
- [ ] Migración `2026-07-04_demo-bot.sql` aplicada → existe la tabla de sesiones del bot y el límite diario persiste.

## 13. Producción / Vercel

- [ ] El deploy nuevo responde en el dominio esperado.
- [ ] No hay errores críticos en logs de Vercel.
- [ ] Analytics y Speed Insights reportan (los 404 de `/_vercel/*` solo ocurren en local).
- [ ] Verificar manualmente https://galfredev.com/pulso/privacidad tras cada deploy (la URL limpia la resuelve solo el CDN de Vercel; la suite e2e local no puede cubrirla — ver e2e/baseline.spec.ts).

## 14. Cierre de release

- [ ] `npm run check` OK (lint + typecheck + unit + build).
- [ ] Suite e2e completa verde contra build de producción (`--retries=0`).
- [ ] La rama está pusheada a GitHub.
- [ ] El sitio se siente premium, claro y consistente de punta a punta, en ambos idiomas.

## Notas

- Resultado general:
- Bugs encontrados:
- Ajustes pendientes:
- ¿Listo para promover a dominio principal?: Sí / No
