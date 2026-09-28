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
