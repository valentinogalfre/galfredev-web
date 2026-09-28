# Proceso en vivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el zig-zag de «Cómo trabajo» por una ejecución: los 3 pasos a la izquierda y una consola `proceso.run` sticky que avanza (en cola → corriendo → listo) con el scroll.

**Architecture:** Lógica pura en `src/lib/process-run.ts` (estados, avance, log; testeada con Vitest). `ProcessSection` (server) pasa el copy del diccionario a `ProcessRun` (client), que detecta el paso activo con un listener de scroll gateado por IntersectionObserver y dibuja la consola; los estados visuales viven en un bloque `run-*` de `globals.css`.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind v4, framer-motion 12 (solo `animate`/`useMotionValue` para el contador), Vitest, Playwright.

Spec: `docs/superpowers/specs/2026-09-27-proceso-en-vivo-design.md`

---

## File Structure

| Archivo | Acción | Responsabilidad |
|---|---|---|
| `src/lib/process-run.ts` | Crear | Motor puro: `initialStages`, `advance`, `finish`, `allDone`, `consoleStatus`, `logLines`, `activeIndex`. |
| `src/lib/process-run.test.ts` | Crear | Contratos del motor. |
| `src/types/content.ts` | Modificar | `ProcessStep`, `ProcessConsole`; `HomeContent.process` los usa. |
| `src/content/es/index.ts`, `src/content/en/index.ts` | Modificar | Copy nuevo de pasos y consola. |
| `src/app/globals.css` | Modificar | Bloque «Proceso en vivo» (`run-*`). |
| `src/components/sections/process-run.tsx` | Crear | Client: pasos + consola + detección de scroll + temporizador + contador. |
| `src/components/sections/process-section.tsx` | Reescribir | Server: heading + `ProcessRun`. |
| `src/components/motion/draw-line.tsx` | Borrar | Solo lo usaba el zig-zag viejo. |
| `e2e/home-sections.spec.ts` | Modificar | Contratos e2e de la consola (scroll y reduced-motion). |

---

### Task 1: Motor puro del proceso

**Files:**
- Create: `src/lib/process-run.ts`
- Test: `src/lib/process-run.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import {
  activeIndex,
  advance,
  allDone,
  consoleStatus,
  finish,
  initialStages,
  logLines,
  type StageState,
} from './process-run'

const steps = [
  { log: { run: 'diag…', ok: 'diag ok' } },
  { log: { run: 'impl…', ok: 'impl ok' } },
  { log: { run: 'mejora…', ok: 'mejora ok' } },
]

// Contrato: la consola refleja el paso activo — lo anterior terminó, lo
// posterior espera en cola y el activo corre hasta que termina.
describe('advance', () => {
  it('sin paso activo todo queda en cola', () => {
    expect(advance(initialStages(3), -1)).toEqual(['queued', 'queued', 'queued'])
  })

  it('el paso activo corre y los anteriores quedan listos', () => {
    expect(advance(initialStages(3), 1)).toEqual(['done', 'running', 'queued'])
  })

  it('saltar varios pasos de golpe deja listos los salteados', () => {
    expect(advance(initialStages(3), 2)).toEqual(['done', 'done', 'running'])
  })

  it('scrollear hacia arriba rebobina lo posterior pero no des-termina el activo', () => {
    expect(advance(['done', 'done', 'running'], 1)).toEqual(['done', 'done', 'queued'])
  })
})

describe('finish', () => {
  it('termina la etapa que corre', () => {
    expect(finish(['done', 'running', 'queued'], 1)).toEqual(['done', 'done', 'queued'])
  })

  it('no toca nada si la etapa ya no corre (se rebobinó antes del timeout)', () => {
    const stages: StageState[] = ['done', 'queued', 'queued']
    expect(finish(stages, 1)).toBe(stages)
  })
})

describe('consoleStatus', () => {
  it('idle → running → waiting → done', () => {
    expect(consoleStatus(initialStages(3))).toBe('idle')
    expect(consoleStatus(['done', 'running', 'queued'])).toBe('running')
    expect(consoleStatus(['done', 'done', 'queued'])).toBe('waiting')
    expect(consoleStatus(allDone(3))).toBe('done')
  })
})

describe('logLines', () => {
  it('cada etapa iniciada suma su línea y las terminadas, su resultado', () => {
    expect(logLines(['done', 'running', 'queued'], steps)).toEqual([
      { id: '0-run', kind: 'run', text: 'diag…', live: false },
      { id: '0-ok', kind: 'ok', text: 'diag ok', live: false },
      { id: '1-run', kind: 'run', text: 'impl…', live: true },
    ])
  })

  it('los ids son estables entre estados (React no re-anima líneas viejas)', () => {
    const before = logLines(['running', 'queued', 'queued'], steps).map((line) => line.id)
    const after = logLines(['done', 'running', 'queued'], steps).map((line) => line.id)
    expect(after.slice(0, before.length)).toEqual(before)
  })
})

describe('activeIndex', () => {
  it('es el último paso que ya cruzó la línea; -1 si ninguno', () => {
    expect(activeIndex([500, 900, 1300], 450)).toBe(-1)
    expect(activeIndex([300, 900, 1300], 450)).toBe(0)
    expect(activeIndex([-600, -100, 440], 450)).toBe(2)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/process-run.test.ts`
Expected: FAIL — `Failed to resolve import "./process-run"`.

- [ ] **Step 3: Write minimal implementation**

```ts
/**
 * Motor puro de «Proceso en vivo» (sección Cómo trabajo): estados de cada
 * etapa de la consola, avance/rebobinado según el paso activo, estado general
 * y líneas del log. Sin React ni DOM: lo usa process-run.tsx y lo cubre
 * process-run.test.ts.
 */

export type StageState = 'queued' | 'running' | 'done'
export type ConsoleStatus = 'idle' | 'running' | 'waiting' | 'done'

type RunLogStep = { log: { run: string; ok: string } }

export type LogLine = {
  /** Estable por etapa y tipo: React no re-anima las líneas que ya estaban. */
  id: string
  kind: 'run' | 'ok'
  text: string
  /** La etapa corre ahora: la línea muestra el cursor. */
  live: boolean
}

export function initialStages(count: number): StageState[] {
  return Array.from({ length: count }, () => 'queued' as const)
}

export function allDone(count: number): StageState[] {
  return Array.from({ length: count }, () => 'done' as const)
}

/**
 * Paso activo `k`: lo anterior terminó, lo posterior vuelve a la cola y `k`
 * corre (si ya había terminado, queda terminado). `k = -1`: todo en cola.
 */
export function advance(stages: StageState[], k: number): StageState[] {
  return stages.map((state, i) => {
    if (i < k) return 'done'
    if (i > k) return 'queued'
    return state === 'done' ? 'done' : 'running'
  })
}

/** Fin del «corriendo» de `k`. Si ya no corre (se rebobinó), no cambia nada. */
export function finish(stages: StageState[], k: number): StageState[] {
  if (stages[k] !== 'running') return stages
  return stages.map((state, i) => (i === k ? 'done' : state))
}

export function consoleStatus(stages: StageState[]): ConsoleStatus {
  if (stages.includes('running')) return 'running'
  if (stages.length > 0 && stages.every((state) => state === 'done')) return 'done'
  if (stages.includes('done')) return 'waiting'
  return 'idle'
}

export function logLines(stages: StageState[], steps: RunLogStep[]): LogLine[] {
  return stages.flatMap((state, i) => {
    if (state === 'queued') return []
    const lines: LogLine[] = [
      { id: `${i}-run`, kind: 'run', text: steps[i].log.run, live: state === 'running' },
    ]
    if (state === 'done') lines.push({ id: `${i}-ok`, kind: 'ok', text: steps[i].log.ok, live: false })
    return lines
  })
}

/** Último paso cuya referencia (top) ya cruzó `line`; -1 si ninguno. */
export function activeIndex(tops: number[], line: number): number {
  let active = -1
  tops.forEach((top, i) => {
    if (top <= line) active = i
  })
  return active
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/process-run.test.ts`
Expected: PASS (11 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/process-run.ts src/lib/process-run.test.ts
git commit -m "feat(proceso): motor puro de la consola del proceso (estados, avance y log)"
```

---

### Task 2: Contrato de contenido y copy bilingüe

**Files:**
- Modify: `src/types/content.ts` (tipo `HomeContent.process`)
- Modify: `src/content/es/index.ts` (bloque `process`)
- Modify: `src/content/en/index.ts` (bloque `process`)

- [ ] **Step 1: Tipos** — en `src/types/content.ts`, antes de `type HomeContent`, agregar:

```ts
/** Paso de «Cómo trabajo»: copy de la lista + lo que imprime la consola. */
export type ProcessStep = {
  title: string
  description: string
  outcome: string
  /** Cuándo pasa, en la lista: «Semana 1». */
  when: string
  /** Nombre corto en la consola: «Diagnóstico». */
  stage: string
  /** Cuándo, abreviado para la consola: «sem 1». */
  stageWhen: string
  /** Líneas del log (ilustrativas): mientras corre y al terminar. */
  log: { run: string; ok: string }
  /** Día del proyecto al que cuenta el contador de la consola. */
  day: number
}

/** Textos de la consola proceso.run (el comentario aclara que es un ejemplo). */
export type ProcessConsole = {
  name: string
  command: string
  comment: string
  status: { idle: string; running: string; waiting: string; done: string }
  dayLabel: string
}
```

y reemplazar la línea `process: { title: string; steps: { title: string; description: string; outcome: string }[] }` por:

```ts
  process: { title: string; steps: ProcessStep[]; console: ProcessConsole }
```

- [ ] **Step 2: Run typecheck to verify it fails**

Run: `npx tsc --noEmit`
Expected: FAIL en `src/content/es/index.ts` y `src/content/en/index.ts` (faltan `when`, `stage`, `stageWhen`, `log`, `day` y `console`).

- [ ] **Step 3: Copy es** — reemplazar el bloque `process` de `src/content/es/index.ts` por:

```ts
    process: {
      title: 'Cómo trabajo',
      steps: [
        {
          title: 'Diagnóstico de negocio',
          description:
            'Ubicamos dónde se pierde tiempo, control o facturación y qué conviene atacar primero.',
          outcome: 'Problema real definido, prioridad e impacto claros.',
          when: 'Semana 1',
          stage: 'Diagnóstico',
          stageWhen: 'sem 1',
          log: {
            run: 'diagnóstico · relevando operación…',
            ok: '3 fugas detectadas: turnos, cobranzas, seguimiento',
          },
          day: 7,
        },
        {
          title: 'Implementación enfocada',
          description:
            'Armamos la solución con el nivel justo de automatización, integración o software.',
          outcome: 'En marcha rápido y con sentido operativo.',
          when: 'Semanas 2–4',
          stage: 'Implementación',
          stageWhen: 'sem 2–4',
          log: {
            run: 'implementación · bot + integraciones…',
            ok: 'bot de WhatsApp en producción · 24/7',
          },
          day: 28,
        },
        {
          title: 'Ajuste y mejora continua',
          description:
            'Medimos qué funcionó, corregimos fricción real y definimos el siguiente paso útil.',
          outcome: 'La solución acompaña el crecimiento sin congelarse.',
          when: 'Mes 2 en adelante',
          stage: 'Mejora',
          stageWhen: 'mes 2 +',
          log: {
            run: 'mejora continua · midiendo…',
            ok: 'tablero de métricas en vivo · próximo paso definido',
          },
          day: 60,
        },
      ],
      console: {
        name: 'proceso.run',
        command: 'galfredev run proceso --negocio tu-pyme',
        comment: '# ejemplo de un proyecto típico · avanza con tu scroll',
        status: {
          idle: 'en cola',
          running: 'corriendo',
          waiting: 'esperando scroll',
          done: 'completo',
        },
        dayLabel: 'día',
      },
    },
```

- [ ] **Step 4: Copy en** — reemplazar el bloque `process` de `src/content/en/index.ts` por:

```ts
    process: {
      title: 'How I work',
      steps: [
        {
          title: 'Business diagnosis',
          description:
            'We pinpoint where time, control or revenue is leaking and what to tackle first.',
          outcome: 'A real problem defined, with clear priority and impact.',
          when: 'Week 1',
          stage: 'Diagnosis',
          stageWhen: 'wk 1',
          log: {
            run: 'diagnosis · mapping the operation…',
            ok: '3 leaks found: bookings, collections, follow-up',
          },
          day: 7,
        },
        {
          title: 'Focused implementation',
          description:
            'We build the solution with just the right level of automation, integration or software.',
          outcome: 'Up and running fast, and operationally sound.',
          when: 'Weeks 2–4',
          stage: 'Build',
          stageWhen: 'wk 2–4',
          log: {
            run: 'build · bot + integrations…',
            ok: 'WhatsApp bot in production · 24/7',
          },
          day: 28,
        },
        {
          title: 'Tuning and continuous improvement',
          description:
            'We measure what worked, remove real friction and define the next useful step.',
          outcome: 'The solution keeps pace with your growth instead of freezing.',
          when: 'Month 2 onward',
          stage: 'Improve',
          stageWhen: 'mo 2 +',
          log: {
            run: 'continuous improvement · measuring…',
            ok: 'live metrics dashboard · next step defined',
          },
          day: 60,
        },
      ],
      console: {
        name: 'process.run',
        command: 'galfredev run process --business your-smb',
        comment: '# example of a typical project · runs with your scroll',
        status: {
          idle: 'queued',
          running: 'running',
          waiting: 'waiting for scroll',
          done: 'complete',
        },
        dayLabel: 'day',
      },
    },
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit && npx vitest run src/lib/i18n.test.ts`
Expected: typecheck limpio; i18n PASS (ningún string vacío en ningún idioma).

- [ ] **Step 6: Commit**

```bash
git add src/types/content.ts src/content/es/index.ts src/content/en/index.ts
git commit -m "feat(proceso): copy bilingüe de etapas y consola del proceso"
```

---

### Task 3: Estilos de la consola (`globals.css`)

**Files:**
- Modify: `src/app/globals.css` (agregar al final, antes del bloque «Paridad Windows»)

- [ ] **Step 1: Agregar el bloque**

```css
/* ---------- Proceso en vivo (src/components/sections/process-run.tsx) ----------
   Estados por data-state / data-status; solo animan opacity, transform y
   colores. Con reduced-motion el componente arranca todo "done" y acá se
   apagan giros, latidos, cursores y entradas del log. */
.run-console {
  overflow: hidden;
  border-radius: 1.4rem;
  border: 1px solid var(--surface-border);
  background: linear-gradient(180deg, #0c1725, #070d17);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.run-dot {
  background: rgba(255, 255, 255, 0.26);
  transition:
    background-color 0.3s var(--ease-premium),
    box-shadow 0.3s var(--ease-premium);
}

.run-console[data-status="running"] .run-dot {
  background: #3dddc4;
  animation: run-ping 1.2s var(--ease-premium) infinite;
}

.run-console[data-status="waiting"] .run-dot {
  background: #2a9184;
}

.run-console[data-status="done"] .run-dot {
  background: #3dddc4;
  box-shadow: 0 0 10px rgba(61, 221, 196, 0.7);
}

.run-node {
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  background: #09111c;
  transition:
    border-color 0.3s var(--ease-premium),
    box-shadow 0.3s var(--ease-premium);
}

/* Barrido del «corriendo»: anillo cónico que gira. */
.run-node::before {
  content: "";
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  opacity: 0;
  background: conic-gradient(
    from 0deg,
    rgba(61, 221, 196, 0),
    rgba(61, 221, 196, 0.1) 35%,
    #3dddc4 92%,
    rgba(61, 221, 196, 0)
  );
  -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2.5px));
  mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2.5px));
  transition: opacity 0.2s var(--ease-premium);
}

/* Destello cálido al terminar: se apaga solo y deja el teal. */
.run-node::after {
  content: "";
  position: absolute;
  inset: -1.5px;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  background: radial-gradient(circle at 35% 30%, #ffd6a8, #ffb46a 58%, #ee8a3e);
}

.run-node svg {
  position: relative;
  z-index: 1;
  fill: none;
  stroke: #04211d;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  transition: stroke-dashoffset 0.38s var(--ease-premium) 0.12s;
}

.run-stage[data-state="running"] .run-node {
  border-color: rgba(61, 221, 196, 0.16);
  box-shadow: 0 0 22px rgba(61, 221, 196, 0.18);
}

.run-stage[data-state="running"] .run-node::before {
  opacity: 1;
  animation: run-spin 0.8s linear infinite;
}

.run-stage[data-state="done"] .run-node {
  border-color: transparent;
  background: linear-gradient(145deg, #3dddc4, #1f7f73);
  box-shadow: 0 0 20px rgba(61, 221, 196, 0.34);
}

.run-stage[data-state="done"] .run-node::after {
  animation: run-cool 0.9s var(--ease-premium) both;
}

.run-stage[data-state="done"] .run-node svg {
  stroke-dashoffset: 0;
}

.run-label {
  color: rgba(255, 255, 255, 0.72);
  transition: color 0.3s var(--ease-premium);
}

.run-stage[data-state="queued"] .run-label {
  color: rgba(255, 255, 255, 0.56);
}

.run-conn::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, #2a9184, #3dddc4);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s var(--ease-premium) 0.15s;
}

.run-conn[data-on]::after {
  transform: scaleX(1);
}

.run-line {
  display: flex;
  gap: 0.75rem;
}

.run-line-n {
  flex: none;
  width: 1.3em;
  text-align: right;
  color: rgba(255, 255, 255, 0.26);
  user-select: none;
}

.run-line-in {
  animation: run-line-in 0.26s var(--ease-premium) both;
}

.run-line-live > span:last-child::after {
  content: "▍";
  margin-left: 4px;
  color: #3dddc4;
  animation: run-blink 1s steps(1) infinite;
}

/* Paso activo a color pleno; el resto, atenuado (solo mientras hay activo). */
.run-step :is(.run-step-num, .run-step-when, .run-step-title, .run-step-desc, .run-step-out, .run-step-out svg) {
  transition:
    opacity 0.3s var(--ease-premium),
    color 0.3s var(--ease-premium),
    border-color 0.3s var(--ease-premium),
    background-color 0.3s var(--ease-premium);
}

[data-has-active] > .run-step:not([data-active]) .run-step-num {
  opacity: 0.4;
}

[data-has-active] > .run-step:not([data-active]) :is(.run-step-when, .run-step-desc, .run-step-out svg) {
  color: rgba(255, 255, 255, 0.56);
}

[data-has-active] > .run-step:not([data-active]) .run-step-title {
  color: rgba(255, 255, 255, 0.72);
}

[data-has-active] > .run-step:not([data-active]) .run-step-out {
  color: rgba(255, 255, 255, 0.72);
  border-color: var(--surface-border);
  background-color: rgba(255, 255, 255, 0.02);
}

/* Mobile: consola compacta y sticky arriba; del log, solo la última línea. */
@media (max-width: 1023.98px) {
  .run-console {
    box-shadow:
      0 18px 44px rgba(3, 5, 10, 0.92),
      inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .run-log .run-line:not(:last-child) {
    display: none;
  }
}

@keyframes run-spin {
  to { transform: rotate(360deg); }
}

@keyframes run-ping {
  0% { box-shadow: 0 0 0 0 rgba(61, 221, 196, 0.55); }
  100% { box-shadow: 0 0 0 7px rgba(61, 221, 196, 0); }
}

@keyframes run-cool {
  from { opacity: 1; }
  to { opacity: 0; }
}

@keyframes run-line-in {
  from { opacity: 0; transform: translateY(5px); }
}

@keyframes run-blink {
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .run-console *,
  .run-console *::before,
  .run-console *::after,
  .run-step * {
    animation: none !important;
    transition: none !important;
  }

  .run-line-live > span:last-child::after {
    content: none;
  }
}
```

- [ ] **Step 2: Verify** — `npx next build` compila (el CSS no tiene test propio; lo cubren el build y los e2e de la Task 5).

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(proceso): estilos de la consola proceso.run (estados, destello y versión reducida)"
```

---

### Task 4: Componente cliente `ProcessRun` + sección

**Files:**
- Create: `src/components/sections/process-run.tsx`
- Modify (reescritura completa): `src/components/sections/process-section.tsx`
- Delete: `src/components/motion/draw-line.tsx`

- [ ] **Step 1: Crear `src/components/sections/process-run.tsx`**

```tsx
'use client'

import { useSafeReducedMotion } from '@/components/motion/hydration'
import {
  activeIndex,
  advance,
  allDone,
  consoleStatus,
  finish,
  initialStages,
  logLines,
  type StageState,
} from '@/lib/process-run'
import { cn } from '@/lib/utils'
import type { ProcessConsole, ProcessStep } from '@/types/content'
import { animate, motion, useMotionValue, useTransform } from 'framer-motion'
import { Check } from 'lucide-react'
import { useEffect, useReducer, useRef } from 'react'

/** ms que una etapa queda «corriendo» antes de terminar. */
const RUN_MS = 620
/** Un paso se activa cuando su título cruza esta fracción del viewport. */
const ACTIVE_LINE = 0.5
const EASE = [0.22, 1, 0.36, 1] as const

type RunState = { active: number; stages: StageState[] }
type RunAction = { type: 'activate'; k: number } | { type: 'finish'; k: number }

function reducer(state: RunState, action: RunAction): RunState {
  if (action.type === 'activate') {
    if (action.k === state.active) return state
    return { active: action.k, stages: advance(state.stages, action.k) }
  }
  const stages = finish(state.stages, action.k)
  return stages === state.stages ? state : { ...state, stages }
}

type ProcessRunProps = {
  steps: ProcessStep[]
  consoleCopy: ProcessConsole
}

/**
 * «Cómo trabajo» como una ejecución: los pasos (lista semántica) y la consola
 * proceso.run, que avanza cuando cada título cruza la mitad del viewport.
 * Server e hidratación renderizan «todo en cola» (sin mismatch); con
 * reduced-motion se muestra todo completo y no se sigue el scroll.
 */
export function ProcessRun({ steps, consoleCopy }: ProcessRunProps) {
  const reduced = useSafeReducedMotion()
  const [run, dispatch] = useReducer(reducer, steps.length, (count) => ({
    active: -1,
    stages: initialStages(count),
  }))
  const rootRef = useRef<HTMLDivElement>(null)
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([])

  // El scroll se escucha solo con la sección a la vista; al salir se mide una
  // vez más para dejar el estado final (abajo: todo listo; arriba: en cola).
  useEffect(() => {
    const root = rootRef.current
    if (!root || reduced) return
    let frame = 0
    const measure = () => {
      frame = 0
      const tops = titleRefs.current.map(
        (title) => title?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
      )
      dispatch({ type: 'activate', k: activeIndex(tops, window.innerHeight * ACTIVE_LINE) })
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) window.addEventListener('scroll', onScroll, { passive: true })
      else window.removeEventListener('scroll', onScroll)
      onScroll()
    })
    observer.observe(root)
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [reduced])

  // «corriendo» → «listo» después de RUN_MS (se cancela si el activo cambia).
  const runningIndex = run.stages.indexOf('running')
  useEffect(() => {
    if (runningIndex < 0) return
    const timer = window.setTimeout(() => dispatch({ type: 'finish', k: runningIndex }), RUN_MS)
    return () => window.clearTimeout(timer)
  }, [runningIndex])

  const stages = reduced ? allDone(steps.length) : run.stages
  const active = reduced ? -1 : run.active
  const status = consoleStatus(stages)
  const lines = logLines(stages, steps)

  // Contador de días: MotionValue renderizado como hijo (sin re-renders).
  const lastDay = steps[steps.length - 1]?.day ?? 0
  const targetDay = reduced ? lastDay : active >= 0 ? steps[active].day : 0
  const day = useMotionValue(0)
  const dayText = useTransform(
    day,
    (value) => `${consoleCopy.dayLabel} ${String(Math.round(value)).padStart(2, '0')}`,
  )
  useEffect(() => {
    if (reduced) {
      day.set(targetDay)
      return
    }
    const controls = animate(day, targetDay, { duration: 0.56, ease: EASE })
    return () => controls.stop()
  }, [day, targetDay, reduced])

  return (
    <div
      ref={rootRef}
      data-testid="process-run"
      className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-16"
    >
      {/* Consola: arriba y compacta en mobile, columna derecha en desktop.
          aria-hidden: ilustra lo que ya dicen los pasos; sus cambios
          constantes serían ruido para un lector de pantalla. */}
      <div className="sticky top-[4.5rem] z-10 lg:top-28 lg:order-2 lg:self-start">
        <div aria-hidden className="run-console" data-status={status} data-testid="process-console">
          <div className="flex items-center gap-2.5 border-b border-white/[0.055] px-4 py-2.5 font-mono text-[11.5px] lg:py-3 lg:text-xs">
            <span className="run-dot size-2 shrink-0 rounded-full" />
            <span className="font-semibold tracking-[0.02em] text-white">{consoleCopy.name}</span>
            <span className="truncate tracking-[0.04em] text-white/56">· {consoleCopy.status[status]}</span>
            <motion.span className="ml-auto shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-2.5 py-1 text-[11px] tabular-nums tracking-[0.08em] text-white/72">
              {dayText}
            </motion.span>
          </div>

          <ol className="grid grid-cols-3 px-1 pb-2.5 pt-3.5 lg:px-2.5 lg:pb-5 lg:pt-6">
            {steps.map((step, i) => (
              <li
                key={step.stage}
                data-state={stages[i]}
                className="run-stage relative flex flex-col items-center gap-2 text-center"
              >
                <span className="run-node relative grid size-[30px] place-items-center rounded-full lg:size-10">
                  <svg viewBox="0 0 24 24" className="size-3.5 lg:size-[18px]">
                    <path d="M5.5 12.5l4.2 4.2L18.5 8" pathLength={1} />
                  </svg>
                </span>
                <span className="run-label font-mono text-[9.5px] font-semibold uppercase tracking-[0.08em] lg:text-[10px] lg:tracking-[0.14em]">
                  {step.stage}
                </span>
                <span className="-mt-1 hidden font-mono text-[10px] tracking-[0.06em] text-white/56 lg:block">
                  {step.stageWhen}
                </span>
                {i < steps.length - 1 ? (
                  <span
                    data-on={stages[i] === 'done' ? '' : undefined}
                    className="run-conn absolute left-[calc(50%+21px)] top-[14px] h-0.5 w-[calc(100%-42px)] overflow-hidden rounded-full bg-white/8 lg:left-[calc(50%+28px)] lg:top-[19px] lg:w-[calc(100%-56px)]"
                  />
                ) : null}
              </li>
            ))}
          </ol>

          <div className="run-log border-t border-white/[0.055] bg-black/25 px-4 pb-3 pt-2.5 font-mono text-[11.5px] leading-[1.85] lg:min-h-[calc(8*1.85em+1.75rem)] lg:pb-4 lg:pt-3 lg:text-[12.5px]">
            <p className="run-line">
              <span className="run-line-n">1</span>
              <span className="text-white">
                <span className="text-white/56">$</span> {consoleCopy.command}
              </span>
            </p>
            <p className="run-line">
              <span className="run-line-n">2</span>
              <span className="text-white/56">{consoleCopy.comment}</span>
            </p>
            {lines.map((line, j) => (
              <p
                key={line.id}
                data-kind={line.kind}
                className={cn('run-line run-line-in', line.live && 'run-line-live')}
              >
                <span className="run-line-n">{j + 3}</span>
                <span className={line.kind === 'ok' ? 'text-[#c4f6ec]' : 'text-white/72'}>
                  <span className="text-[#3dddc4]">{line.kind === 'ok' ? '✓' : '▸'}</span> {line.text}
                </span>
              </p>
            ))}
          </div>
        </div>
      </div>

      <ol data-has-active={active >= 0 ? '' : undefined} className="lg:order-1">
        {steps.map((step, i) => (
          <li
            key={step.title}
            data-active={i === active ? '' : undefined}
            className="run-step border-t border-white/[0.055] py-9 first:border-t-0 first:pt-6 sm:py-12 lg:py-16 lg:first:pt-2"
          >
            <div className="flex items-baseline gap-3.5">
              <span
                aria-hidden
                className="run-step-num bg-[linear-gradient(95deg,#a5f0e0_5%,#3dddc4_45%,#2a9184_95%)] bg-clip-text pr-1 text-[2.2rem] italic leading-none text-transparent [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-[2.6rem]"
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="run-step-when font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[#3dddc4]/90">
                {step.when}
              </span>
            </div>
            <h3
              ref={(title) => {
                titleRefs.current[i] = title
              }}
              className="run-step-title mt-3 text-[1.35rem] font-medium leading-[1.08] tracking-[-0.045em] text-white sm:text-[1.8rem]"
            >
              {step.title}
            </h3>
            <p className="run-step-desc mt-3 max-w-[46ch] text-sm leading-7 text-white/70 sm:text-base">
              {step.description}
            </p>
            <p className="run-step-out mt-5 flex items-start gap-3 rounded-[1.1rem] border border-[rgba(61,221,196,0.18)] bg-[rgba(31,127,115,0.09)] px-4 py-3 text-sm leading-6 text-white sm:text-[15px]">
              <Check size={16} strokeWidth={2.4} aria-hidden className="mt-1 shrink-0 text-[#3dddc4]" />
              {step.outcome}
            </p>
          </li>
        ))}
      </ol>
    </div>
  )
}
```

- [ ] **Step 2: Reescribir `src/components/sections/process-section.tsx`**

```tsx
import { Reveal } from '@/components/motion/reveal'
import { ProcessRun } from '@/components/sections/process-run'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary } from '@/lib/i18n'
import type { Locale } from '@/types/content'

/**
 * Server component: «Cómo trabajo» como una ejecución — los pasos del
 * diccionario y la consola proceso.run que avanza con el scroll
 * (ProcessRun). Diseño: docs/superpowers/specs/2026-09-27-proceso-en-vivo-design.md
 */
export function ProcessSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const { process } = dict.home
  const sectionId = locale === 'es' ? 'proceso' : 'process'
  const kicker =
    dict.common.nav.find((item) => item.href === `/#${sectionId}`)?.label ??
    process.title

  return (
    <section id={sectionId} className="px-4 py-14 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal variant="section">
          <SectionHeading eyebrow={kicker} title={process.title} />
        </Reveal>

        <div className="mt-8 sm:mt-14">
          <ProcessRun steps={process.steps} consoleCopy={process.console} />
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Borrar DrawLine**

Run: `git rm src/components/motion/draw-line.tsx && grep -rn "draw-line\|DrawLine" src`
Expected: sin resultados del grep.

- [ ] **Step 4: Verify**

Run: `npm run lint && npm run typecheck && npm run test`
Expected: lint y typecheck limpios; todos los tests unitarios PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/process-run.tsx src/components/sections/process-section.tsx
git commit -m "feat(proceso): «Cómo trabajo» corre como una ejecución (consola proceso.run sticky)"
```

---

### Task 5: Contratos e2e

**Files:**
- Modify: `e2e/home-sections.spec.ts` (agregar al final)

- [ ] **Step 1: Write the failing tests**

```ts
// Contrato: «Cómo trabajo» corre como una ejecución. Con el último paso ya
// pasada la mitad de la pantalla, la consola termina completa y con el
// resultado de las 3 etapas en el log.
test('la consola del proceso completa las 3 etapas al scrollear', async ({ page }) => {
  await page.route('**/hdr/city.hdr', (route) => route.abort())
  await page.goto('/')
  const consoleEl = page.getByTestId('process-console')
  await expect(consoleEl).toHaveAttribute('data-status', 'idle')
  await expect(consoleEl.locator('[data-kind="ok"]')).toHaveCount(0)

  await page.evaluate(() => {
    const titles = document.querySelectorAll('[data-testid="process-run"] h3')
    const last = titles[titles.length - 1] as HTMLElement
    const top = window.scrollY + last.getBoundingClientRect().top - window.innerHeight * 0.3
    window.scrollTo({ top, behavior: 'instant' })
  })

  await expect(consoleEl).toHaveAttribute('data-status', 'done', { timeout: 10_000 })
  await expect(consoleEl.locator('[data-kind="ok"]')).toHaveCount(3)
})

test.describe('movimiento reducido', () => {
  // reducedMotion va en contextOptions: como opción suelta de test.use se
  // ignora en silencio (matchMedia seguía en false).
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  // Contrato: con prefers-reduced-motion la consola muestra el proceso
  // completo sin depender del scroll, y la home hidrata sin mismatch (#418).
  test('la consola arranca completa y la home hidrata sin errores', async ({ page }) => {
    const hydrationErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error' && /418|hydrat/i.test(message.text())) {
        hydrationErrors.push(message.text())
      }
    })
    page.on('pageerror', (error) => hydrationErrors.push(error.message))
    await page.route('**/hdr/city.hdr', (route) => route.abort())
    await page.goto('/')
    const consoleEl = page.getByTestId('process-console')
    await expect(consoleEl).toHaveAttribute('data-status', 'done')
    await expect(consoleEl.locator('[data-kind="ok"]')).toHaveCount(3)
    expect(hydrationErrors).toEqual([])
  })
})
```

- [ ] **Step 2: Run them**

Run (con el build de prod en :3100): `npx playwright test e2e/home-sections.spec.ts --retries=0`
Expected: PASS en mobile y desktop (antes de la Task 4 fallaban: no existía `process-console`).

- [ ] **Step 3: Suite completa**

Run: `npm run build && (npm run start -- --port 3100 &) && npx playwright test --retries=0`
Expected: todo PASS.

- [ ] **Step 4: Commit**

```bash
git add e2e/home-sections.spec.ts
git commit -m "test(proceso): la consola completa al scrollear y arranca completa con reduced-motion"
```

---

### Task 6: Verificación visual

- [ ] **Step 1:** Capturas de `/` y `/en` en 1440×900 y 390×844 recorriendo la sección (antes / durante / después del scroll) y con `reducedMotion: 'reduce'`. Chequear: consola sticky sin tapar el header, alineación con el resto de secciones, log sin saltos de alto en desktop, una sola línea en mobile, pasos atenuados salvo el activo.
