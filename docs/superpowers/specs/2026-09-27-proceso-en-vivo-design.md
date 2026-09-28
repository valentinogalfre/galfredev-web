# Proceso en vivo — rediseño de «Cómo trabajo»

Fecha: 2026-09-27 · Estado: implementado — en producción desde 2026-09-28 (galfredevs/galfredev#48–#51)
Prototipo aprobado: https://claude.ai/artifact/2dBD4VWFq2HXmUiW1F91oZ

## Problema

La sección `#proceso` / `#process` de la home es un timeline en zig-zag de 3
pasos: en desktop cada paso ocupa media columna y deja la otra mitad vacía
(la sección más «abierta» del sitio). Además cuenta el método con copy
genérico, sin mostrar nada del producto que se vende.

## Idea

El proceso corre como una de las automatizaciones que vende GalfreDev: a la
izquierda los 3 pasos (legibles, semánticos, sin cambios de copy); a la
derecha una consola de ejecución fija (`proceso.run`) que avanza con el
scroll. Cada paso que cruza la mitad de la pantalla pasa de **en cola →
corriendo → listo** en la consola y deja su línea en el log.

## Qué ve el visitante

- **Desktop (≥ lg):** grilla de 2 columnas (pasos 1fr · consola .92fr),
  título alineado a la izquierda como Servicios/Proyectos, contenedor
  `max-w-7xl`. La consola es `position: sticky` (debajo del header fijo): la
  página scrollea normal, sin scroll-jacking.
- **Mobile (< lg):** la consola va arriba, compacta y sticky bajo el header
  (nodos chicos, solo la última línea del log); los pasos pasan por debajo.
- **Paso activo:** número, título y resultado a color pleno; los demás, atenuados.
- **Consola:**
  - header: punto de estado (late mientras corre), `proceso.run`, estado
    (`en cola` · `corriendo` · `esperando scroll` · `completo`) y contador
    `día NN` que cuenta hasta el día de la etapa (07 · 28 · 60);
  - track: 3 nodos (anillo hueco → barrido teal que gira → relleno teal con
    check que se dibuja y un destello cálido) unidos por conectores que se
    llenan cuando la etapa anterior termina;
  - log: `$ galfredev run proceso --negocio tu-pyme`, un comentario que aclara
    que es un **ejemplo**, y por etapa una línea «corriendo» (con cursor) y una
    «✓ resultado».
- **Scroll hacia arriba rebobina:** las etapas posteriores vuelven a «en cola».
- **Movimiento reducido:** todo completo desde el inicio, log entero, sin
  giros, cursores, conteos ni atenuación.

## Honestidad del contenido

El log es ilustrativo y lo dice (comentario `# ejemplo de un proyecto típico`).
No se inventan métricas: el «+38 %» del prototipo pasa a «tablero de métricas
en vivo» (si hay un número real de un caso, se reemplaza en el diccionario).

## Arquitectura

| Pieza | Tipo | Responsabilidad |
|---|---|---|
| `src/lib/process-run.ts` | lógica pura | Estados de etapa, avance/rebobinado, estado de la consola y líneas del log. Sin React ni DOM → test unitario. |
| `src/components/sections/process-section.tsx` | server | Diccionario → props planas; heading. |
| `src/components/sections/process-run.tsx` | client | Pasos + consola; detecta el paso activo por scroll, corre el temporizador «corriendo → listo» y el contador de días. |
| `globals.css` (bloque `run-*`) | CSS | Estados visuales por `data-state`, keyframes y la versión reducida. |

### Contenido (contrato `Dictionary`)

`home.process` suma por paso `when` (`Semana 1`), `stage` (`Diagnóstico`),
`stageWhen` (`sem 1`), `log: { run, ok }` y `day`; y un bloque `console` con
nombre, comando, comentario, estados y la etiqueta del día. Ambos idiomas:
si falta una clave no compila y el test de i18n exige strings no vacíos.

### Motor (`process-run.ts`)

- `advance(stages, k)`: etapas `< k` → `done`; `> k` → `queued`; la `k`
  queda `done` si ya lo estaba, si no `running`. `k = -1` → todo en cola.
- `finish(stages, k)`: `running → done` (lo dispara un timeout de 620 ms).
- `consoleStatus(stages)`: `running` si alguna corre; `done` si las 3
  terminaron; `waiting` si hay alguna lista; si no, `idle`.
- `logLines(stages, steps)`: por etapa no encolada, línea `run` (con `live`
  si corre) y, si terminó, línea `ok`. Ids estables → React no re-anima las
  líneas existentes.

### Detección del paso activo

Un IntersectionObserver sobre la sección conecta un listener de scroll
pasivo y throttleado con rAF **solo mientras la sección está a la vista**
(y computa una vez al salir, para dejar el estado final: todo listo abajo,
todo en cola arriba). Activo = el último paso cuyo título ya cruzó la mitad
del viewport. Tres lecturas de posición por frame, sin escrituras
intercaladas; React solo re-renderiza cuando el activo cambia.

### Rendimiento y accesibilidad

- Solo animan opacity, transform, color y background (compositor); el
  contador de días es un `MotionValue` renderizado como hijo (sin re-renders).
- Sin hydration mismatch: server e hidratación renderizan «todo en cola»; el
  movimiento reducido se aplica recién hidratado (`useSafeReducedMotion`).
- La consola es `aria-hidden` (ilustra lo que ya dicen los pasos; sus cambios
  constantes serían ruido para lectores de pantalla). Los pasos siguen siendo
  un `<ol>` con `<h3>` por paso.
- El log reserva su alto final (sin layout shift al sumar líneas).

## Tests (contratos)

- **Unit (`process-run.test.ts`):** avance, rebobinado, «listo» no retrocede
  al volver a su paso, estado de consola, líneas del log e ids estables.
- **e2e (`home-sections.spec.ts`):**
  - al scrollear hasta el final de la sección, la consola termina
    `completo` con las 3 líneas `✓`;
  - con `reducedMotion: 'reduce'`, la consola está completa sin scrollear y
    la home hidrata sin errores de consola;
  - los pasos siguen presentes como lista en ambos idiomas (los tests de
    orden y anchors existentes siguen pasando).

## Fuera de alcance

Conectar el log a datos reales del bot; cambiar el copy de los pasos;
propuestas B y C del Motion Lab.
