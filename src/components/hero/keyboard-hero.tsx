'use client'

import { detectTier, type GpuTier } from '@/components/three/keyboard/quality'
import dynamic from 'next/dynamic'
import { Component, useCallback, useEffect, useState, type ReactNode } from 'react'
import { KeyboardCss } from './keyboard-css'
import type { TypingState } from './use-typing-loop'

const KeyboardScene = dynamic(
  () => import('@/components/three/keyboard/keyboard-scene').then((m) => m.KeyboardScene),
  { ssr: false },
)

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

/**
 * Orquestador del teclado del hero: arranca SIEMPRE con el teclado CSS (barato,
 * SSR-safe), detecta tier de GPU en idle y, si alcanza, monta la escena WebGL
 * con crossfade suave cuando esta ya renderizó su primer frame con assets.
 */
export function KeyboardHero({ typing, egg = false }: { typing: TypingState; egg?: boolean }) {
  const [tier, setTier] = useState<GpuTier | null>(null)
  const [ready, setReady] = useState(false)
  const [cssGone, setCssGone] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void) => number
      cancelIdleCallback?: (id: number) => void
    }
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(() => setTier(detectTier()))
      return () => w.cancelIdleCallback?.(id)
    }
    const id = window.setTimeout(() => setTier(detectTier()), 1200)
    return () => window.clearTimeout(id)
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

  return (
    <div data-testid="keyboard-hero" className="kb-shell relative" aria-hidden="true">
      {!(webgl && cssGone) && (
        <div
          className="absolute inset-0 transition-opacity duration-[400ms] ease-out"
          style={{ opacity: webgl && ready ? 0 : 1 }}
        >
          <KeyboardCss typing={typing} egg={egg} />
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
