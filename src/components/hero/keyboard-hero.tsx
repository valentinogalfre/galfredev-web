'use client'

import { detectTier, type GpuTier } from '@/components/three/keyboard/quality'
import { cn } from '@/lib/utils'
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useState, type ReactNode } from 'react'
import { KeyboardCss } from './keyboard-css'
import type { TypingState } from './use-typing-loop'

const KeyboardScene = dynamic(
  () => import('@/components/three/keyboard/keyboard-scene').then((m) => m.KeyboardScene),
  { ssr: false },
)

/** ms post-load+idle antes de montar la escena WebGL. Corto: el tier ya se
 *  detectó al hidratar y el HDR viene calentándose en paralelo — este settle
 *  solo evita que la eval de three (~390 KB) caiga en plena hidratación
 *  (long tasks que hundían TBT/LCP en mobile; gate de Lighthouse ≥90). */
const MOUNT_SETTLE_MS = 300
/** Techo del requestIdleCallback del montaje: si el main thread no se libera
 *  solo, se monta igual a los 800 ms (el settle corre después). */
const MOUNT_IDLE_TIMEOUT_MS = 800
/** Presupuesto de materialización: canvas montado sin primer frame con assets
 *  (red muy lenta, HDR caído) → se descarta el WebGL y entra el teclado CSS.
 *  El hero NUNCA queda sin teclado. */
const WEBGL_READY_TIMEOUT_MS = 10_000
/** Duración de la entrada del teclado WebGL (fade + scale + y). */
const WEBGL_IN_MS = 550

/**
 * Si el render WebGL explota (driver raro, shader que no compila), el hero no
 * puede caerse entero: se descarta el canvas y queda el teclado CSS. La pérdida
 * de contexto en runtime NO pasa por acá (no lanza en render): la cubre el
 * listener de `webglcontextlost` registrado en onCreated del Canvas.
 */
class WebglBoundary extends Component<{ onError: () => void; children: ReactNode }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

type KeyboardHeroProps = {
  typing: TypingState
  egg?: boolean
  /**
   * Hero dentro del viewport (IntersectionObserver de hero-client): gatea el
   * rAF driver de la escena WebGL — fuera de viewport la GPU queda en cero.
   */
  visible?: boolean
  /**
   * Progreso de salida del hero (0 arriba → 1 fuera). Llega como MotionValue,
   * nunca como number: leerlo no re-renderiza React por scroll. undefined con
   * prefers-reduced-motion (la salida cinematográfica queda estática).
   */
  scrollProgress?: MotionValue<number>
}

/**
 * Orquestador del teclado del hero — UNA sola materialización, nunca dos
 * teclados. El SSR renderiza el teclado CSS OCULTO (decorativo aria-hidden; el
 * LCP es el h1) y el tier se detecta apenas hidrata (~1 ms):
 *
 * - tier low / sin WebGL / reduced-motion → el CSS hace fade-in inmediato y es
 *   el ÚNICO teclado que se ve.
 * - tier mid/high → el CSS no se muestra nunca: mientras el WebGL carga se ve
 *   el aura (halo teal elíptico respirando, como si el teclado estuviera por
 *   encenderse) y, con el primer frame con assets, el teclado WebGL hace su
 *   única entrada. El HDR (1.5 MB) se calienta por red apenas se conoce el
 *   tier; el MONTAJE del canvas espera a load+idle (la eval de three no debe
 *   pisar la hidratación).
 * - si a los 10 s de montado el canvas no llegó el primer frame → se descarta
 *   el WebGL y entra el CSS: el hero nunca queda vacío.
 */
export function KeyboardHero({
  typing,
  egg = false,
  visible = true,
  scrollProgress,
}: KeyboardHeroProps) {
  const [tier, setTier] = useState<GpuTier | null>(null)
  const [mounted, setMounted] = useState(false)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [auraGone, setAuraGone] = useState(false)

  // Tier INMEDIATO al hidratar (matchMedia + getContext de prueba, ~1 ms):
  // define qué teclado se materializa sin esperar a load/idle — así el CSS
  // jamás se muestra "de puente" en máquinas que van a ver el WebGL.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- detección síncrona intencional: decide el primer paint del teclado
    setTier(detectTier())
  }, [])

  // tier mid/high: (a) calentar YA el HDR por red (solo fetch, no evalúa JS);
  // (b) montar el canvas recién en load + idle + settle corto.
  useEffect(() => {
    if (tier !== 'high' && tier !== 'mid') return
    void fetch('/hdr/city.hdr', { cache: 'force-cache' }).catch(() => {})
    let cancelled = false
    let timer: number | undefined
    let idle: number | undefined
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const fire = () => {
      if (!cancelled) setMounted(true)
    }
    const afterLoad = () => {
      const settle = () => {
        timer = window.setTimeout(fire, MOUNT_SETTLE_MS)
      }
      if (w.requestIdleCallback) idle = w.requestIdleCallback(settle, { timeout: MOUNT_IDLE_TIMEOUT_MS })
      else settle()
    }
    if (document.readyState === 'complete') afterLoad()
    else window.addEventListener('load', afterLoad, { once: true })
    return () => {
      cancelled = true
      window.removeEventListener('load', afterLoad)
      if (idle !== undefined) w.cancelIdleCallback?.(idle)
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [tier])

  // Presupuesto de materialización: canvas montado y sin primer frame a los
  // 10 s → mismo destino que un crash (failed desmonta el canvas y entra el
  // CSS). Determinista: un ReadySignal tardío ya no encuentra canvas.
  useEffect(() => {
    if (!mounted || ready || failed) return
    const t = window.setTimeout(() => setFailed(true), WEBGL_READY_TIMEOUT_MS)
    return () => window.clearTimeout(t)
  }, [mounted, ready, failed])

  // El aura ya cumplió: tras el fade-out (corre en paralelo a la entrada del
  // WebGL) se desmonta para no dejar animaciones vivas invisibles.
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => setAuraGone(true), WEBGL_IN_MS)
    return () => window.clearTimeout(t)
  }, [ready])

  // Contexto WebGL perdido en runtime: mismo destino que un crash de render —
  // se desmonta el canvas y entra el teclado CSS.
  const onContextLost = useCallback(() => setFailed(true), [])

  const webgl = !failed && (tier === 'high' || tier === 'mid')
  // El CSS se ve SOLO cuando es el teclado definitivo: tier bajo o WebGL caído.
  const showCss = failed || tier === 'low'
  // Montado también pre-tier (SSR y primer paint: oculto, opacity 0).
  const cssMounted = tier === null || showCss

  // Salida cinematográfica del fallback CSS: mismo gesto que la cámara WebGL
  // (el teclado se inclina hacia atrás, baja y se achica siguiendo el scroll).
  // Los hooks son incondicionales: sin scrollProgress (reduced-motion) se
  // transforman sobre un MotionValue estático en 0 → estilos identidad.
  const staticProgress = useMotionValue(0)
  const exitProgress = scrollProgress ?? staticProgress
  const cssRotateX = useTransform(exitProgress, [0, 1], [0, 12])
  const cssScale = useTransform(exitProgress, [0, 1], [1, 0.93])
  const cssY = useTransform(exitProgress, [0, 1], [0, 42])

  return (
    <div data-testid="keyboard-hero" className="kb-shell relative" aria-hidden="true">
      {cssMounted && (
        <div className={cn('kb-mask absolute inset-0', showCss ? 'kb-css-in' : 'opacity-0')}>
          <div className="kb-mask-y h-full w-full">
            <motion.div
              className="h-full w-full"
              style={{
                rotateX: cssRotateX,
                scale: cssScale,
                y: cssY,
                transformPerspective: 1200,
              }}
            >
              <KeyboardCss typing={typing} egg={egg} />
            </motion.div>
          </div>
        </div>
      )}
      {webgl && !auraGone && (
        <div
          data-testid="keyboard-aura"
          className="absolute inset-0 transition-opacity duration-[550ms] ease-out"
          style={{ opacity: ready ? 0 : 1 }}
        >
          <div className="kb-aura h-full w-full" />
        </div>
      )}
      {webgl && mounted && (
        <div
          className="kb-mask absolute inset-0 transition-[opacity,transform] duration-[550ms] ease-out"
          style={{
            opacity: ready ? 1 : 0,
            transform: ready ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
          }}
        >
          <div className="kb-mask-y h-full w-full">
            <WebglBoundary onError={() => setFailed(true)}>
              <KeyboardScene
                typing={typing}
                egg={egg}
                tier={tier as GpuTier}
                visible={visible}
                scrollProgress={scrollProgress}
                onReady={() => setReady(true)}
                onContextLost={onContextLost}
              />
            </WebglBoundary>
          </div>
        </div>
      )}
    </div>
  )
}
