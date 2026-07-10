'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isDesktop = window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!isDesktop || reduced) return
    const lenis = new Lenis({ lerp: 0.12, anchors: true })
    let raf: number
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [])
  return <>{children}</>
}
