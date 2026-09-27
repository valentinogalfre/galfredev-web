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
