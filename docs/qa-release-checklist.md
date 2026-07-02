# QA Release Checklist

Checklist manual para validar la web de GalfreDev antes de cerrar release, abrir PR final o promover un deploy como principal.

## URLs a testear

- Preview/producción de esta rama: [https://galfre-dev-next.vercel.app](https://galfre-dev-next.vercel.app)
- Deploy directo de esta publicación: [https://galfre-dev-next-gpi8vykvc-valentinos-projects-50b5dc09.vercel.app](https://galfre-dev-next-gpi8vykvc-valentinos-projects-50b5dc09.vercel.app)
- Dominio actual en producción: [https://galfredev.com](https://galfredev.com)

## 1. Smoke general

- [ ] La home carga completa sin pantalla blanca ni errores visibles.
- [ ] No aparecen errores de hidratación ni overlays rojos en consola.
- [ ] El header, hero, footer y FAB de WhatsApp renderizan bien.
- [ ] Recargar la home varias veces no rompe layout ni animaciones.
- [ ] Las rutas `/login`, `/privacidad`, `/terminos` y `/404` cargan correctamente.

## 2. Hero y primera impresión

- [ ] El headline rotativo cambia suave y sin saltos verticales.
- [ ] La tarjeta derecha cambia sincronizada con el texto del hero.
- [ ] No hay mini-cards cortadas, textos ilegibles ni adornos sucios.
- [ ] Los CTAs del hero se leen claro y se diferencian bien.
- [ ] Los micro-hovers del hero se sienten premium y no exagerados.

## 3. Navbar y navegación

- [ ] Cada item del navbar lleva a la sección correcta.
- [ ] El menú mobile abre y cierra correctamente.
- [ ] El menú mobile también se puede cerrar con `Escape`.
- [ ] Los links del footer a secciones de la home funcionan también desde páginas internas.
- [ ] El botón de acceso / perfil lleva al flujo correcto según sesión.

## 4. Secciones de la home

- [ ] Propuesta de valor: textos claros, sin cortes ni espacios raros.
- [ ] Soluciones: cards consistentes, sin copy roto ni CTAs inconsistentes.
- [ ] Cómo trabajamos: workflow y pasos se ven bien en desktop y mobile.
- [ ] ROI: cards, gráfico y texto mantienen buena jerarquía.
- [ ] Valentino: sección sólida, sin overlays raros ni badges mal ubicados.
- [ ] Perfil teaser: mensaje claro y CTA correcto.
- [ ] Contacto: formulario bien alineado y fácil de leer.

## 5. Responsive

- [ ] Desktop grande (`1440px+`) se ve equilibrado y sin vacíos raros.
- [ ] Laptop (`1280px`) mantiene proporciones correctas.
- [ ] Tablet (`768px–1024px`) no rompe cards, grids ni textos.
- [ ] Mobile (`390px aprox.`) mantiene legibilidad y CTAs accesibles.
- [ ] No hay textos truncados ni solapes en ninguna sección.

## 6. Formularios y leads

- [ ] El formulario no permite envío vacío.
- [ ] El email inválido muestra error claro.
- [ ] El teléfono corto o inválido muestra error claro.
- [ ] El contexto demasiado corto muestra error claro.
- [ ] Los campos largos o raros no rompen UI.
- [ ] El botón de envío se desactiva durante loading.
- [ ] Un envío válido muestra éxito y luego continúa a WhatsApp.
- [ ] Si falla red/backend, el usuario ve un mensaje claro y seguro.

## 7. Login, auth y perfil

- [ ] `/perfil` redirige a `/login` si no hay sesión.
- [ ] `/login` redirige si ya existe sesión.
- [ ] Magic link acepta email válido y rechaza email inválido.
- [ ] OAuth (Google/GitHub/LinkedIn) inicia correctamente si está configurado.
- [ ] Logout cierra sesión y vuelve a login.
- [ ] Guardar perfil funciona con datos válidos.
- [ ] Los errores del perfil aparecen bien ubicados por campo.
- [ ] Subir avatar válido funciona.
- [ ] Avatar inválido o demasiado pesado muestra mensaje claro.
- [ ] El toast de perfil guardado aparece y se puede cerrar.

## 8. SEO y accesibilidad

- [ ] Cada página principal tiene título correcto.
- [ ] Cada página principal tiene meta description coherente.
- [ ] Hay un solo `h1` por página importante.
- [ ] El skip link aparece al navegar con teclado.
- [ ] Botones, enlaces e inputs muestran foco visible.
- [ ] El contraste general sigue siendo legible.
- [ ] `robots.txt` responde correctamente.
- [ ] `sitemap.xml` responde correctamente.

## 9. Seguridad y robustez

- [ ] Los errores visibles al usuario no exponen detalles técnicos.
- [ ] No se ve contenido privado aunque sea un instante sin sesión.
- [ ] El formulario responde bien ante inputs inesperados.
- [ ] No hay redirects raros en login/logout/callback.
- [ ] El sitio no depende de variables faltantes para renderizar páginas públicas.

## 10. Datos y base

- [ ] `lead_intake` recibe leads correctamente.
- [ ] `marketing_consents` registra consentimientos.
- [ ] `profiles` y `user_preferences` guardan cambios del perfil.
- [ ] Si ya aplicaste la migración nueva, existen columnas de trazabilidad extra en `lead_intake`.
- [ ] Si ya aplicaste la migración nueva, existe la tabla `lead_events`.

## 11. Producción / Vercel

- [ ] `https://galfre-dev-next.vercel.app` responde con la versión nueva.
- [ ] `https://galfredev.com` responde con la versión esperada.
- [ ] Si el dominio principal todavía apunta a otro proyecto, está documentado antes de promoción final.
- [ ] No hay errores críticos en logs de Vercel.

## 12. Cierre de release

- [ ] `npm run typecheck` OK
- [ ] `npm run lint` OK
- [ ] `npm run build` OK
- [ ] La rama está pusheada a GitHub.
- [ ] El deploy está online y accesible.
- [ ] El sitio se siente premium, claro y consistente de punta a punta.

## Notas

- Resultado general:
- Bugs encontrados:
- Ajustes pendientes:
- ¿Listo para promover a dominio principal?: Sí / No

- [ ] Verificar manualmente https://galfredev.com/pulso/privacidad tras cada deploy (la URL limpia la resuelve solo el CDN de Vercel; la suite e2e local no puede cubrirla — ver e2e/baseline.spec.ts).
