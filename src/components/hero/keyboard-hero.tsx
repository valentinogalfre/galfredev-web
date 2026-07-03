'use client'

import { detectTier, type GpuTier } from '@/components/three/keyboard/quality'
import dynamic from 'next/dynamic'
import { Component, useEffect, useState, type ReactNode } from 'react'
import { KeyboardCss } from './keyboard-css'
import type { TypingState } from './use-typing-loop'

const KeyboardScene = dynamic(
  () => import('@/components/three/keyboard/keyboard-scene').then((m) => m.KeyboardScene),
  { ssr: false },
)

/**
 * Si el runtime WebGL explota (context lost, driver raro), el hero no puede
 * caerse entero: se descarta el canvas y queda el teclado CSS.
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
export function KeyboardHero({ typing }: { typing: TypingState }) {
  const [tier, setTier] = useState<GpuTier | null>(null)
  const [ready, setReady] = useState(false)
  const [cssGone, setCssGone] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number }
    const idle = w.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200))
    idle(() => setTier(detectTier()))
  }, [])

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
          <KeyboardCss typing={typing} />
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
                tier={tier as GpuTier}
                onReady={() => setReady(true)}
              />
            </WebglBoundary>
          </div>
        </div>
      )}
    </div>
  )
}
