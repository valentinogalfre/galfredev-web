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
