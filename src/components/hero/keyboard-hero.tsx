'use client'

import { detectTier, type GpuTier } from '@/components/three/keyboard/quality'
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useState, type ReactNode } from 'react'
import { KeyboardCss } from './keyboard-css'
import type { TypingState } from './use-typing-loop'

const KeyboardScene = dynamic(
  () => import('@/components/three/keyboard/keyboard-scene').then((m) => m.KeyboardScene),
  { ssr: false },
)

/** ms post-load+idle antes de montar la escena WebGL (deja asentar la página). */
const UPGRADE_SETTLE_MS = 2500

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
 * Orquestador del teclado del hero: arranca SIEMPRE con el teclado CSS (barato,
 * SSR-safe), detecta tier de GPU en idle y, si alcanza, monta la escena WebGL
 * con crossfade suave cuando esta ya renderizó su primer frame con assets.
 */
export function KeyboardHero({
  typing,
  egg = false,
  visible = true,
  scrollProgress,
}: KeyboardHeroProps) {
  const [tier, setTier] = useState<GpuTier | null>(null)
  const [ready, setReady] = useState(false)
  const [cssGone, setCssGone] = useState(false)
  const [failed, setFailed] = useState(false)

  // El upgrade a WebGL (~390 KB de three/r3f + HDR de 1.5 MB) NO compite con la
  // carga inicial: espera a window.load + idle + un colchón. Antes se disparaba
  // en el primer requestIdleCallback y su eval caía en plena hidratación —
  // long tasks que hundían TBT/LCP en mobile (Lighthouse 51 → esto lo saca de
  // la ventana de métricas y, más importante, de la carga real del usuario).
  useEffect(() => {
    let cancelled = false
    let timer: number | undefined
    let idle: number | undefined
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number
      cancelIdleCallback?: (id: number) => void
    }
    const fire = () => {
      if (!cancelled) setTier(detectTier())
    }
    const afterLoad = () => {
      const settle = () => {
        timer = window.setTimeout(fire, UPGRADE_SETTLE_MS)
      }
      if (w.requestIdleCallback) idle = w.requestIdleCallback(settle, { timeout: 2000 })
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
  }, [])

  // Contexto WebGL perdido en runtime: mismo destino que un crash de render —
  // se desmonta el canvas y vuelve el teclado CSS (webgl=false lo re-renderiza
  // con opacidad 1 aunque cssGone haya llegado a true).
  const onContextLost = useCallback(() => setFailed(true), [])

  // Al terminar el crossfade se desmonta el CSS (ya no aporta nada debajo).
  useEffect(() => {
    if (!ready) return
    const t = window.setTimeout(() => setCssGone(true), 600)
    return () => window.clearTimeout(t)
  }, [ready])

  const webgl = !failed && (tier === 'high' || tier === 'mid')

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
      {!(webgl && cssGone) && (
        <div
          className="absolute inset-0 transition-opacity duration-[400ms] ease-out"
          style={{ opacity: webgl && ready ? 0 : 1 }}
        >
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
      )}
      {webgl && (
        <div
          className="kb-fade-x absolute inset-0 transition-opacity duration-[400ms] ease-out"
          style={{ opacity: ready ? 1 : 0 }}
        >
          <div className="kb-fade-y h-full w-full">
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
