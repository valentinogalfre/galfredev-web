'use client'

import { cn } from '@/lib/utils'
import {
  m,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion'
import { useSyncExternalStore, type ReactNode } from 'react'

type BorderGlowCardProps = {
  children: ReactNode
  className?: string
}

export function BorderGlowCard({ children, className }: BorderGlowCardProps) {
  const pointerX = useMotionValue(0.5)
  const pointerY = useMotionValue(0.5)
  const smoothX = useSpring(pointerX, { stiffness: 220, damping: 26 })
  const smoothY = useSpring(pointerY, { stiffness: 220, damping: 26 })
  const reduceMotion = useReducedMotion()
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )

  const glowX = useTransform(smoothX, (value) => `${value * 100}%`)
  const glowY = useTransform(smoothY, (value) => `${value * 100}%`)
  const borderGlow = useMotionTemplate`radial-gradient(320px circle at ${glowX} ${glowY}, rgba(61,221,196,0.2), transparent 62%)`
  const ambientGlow = useMotionTemplate`radial-gradient(180px circle at ${glowX} ${glowY}, rgba(255,255,255,0.08), transparent 52%)`
  const accentGlow = useMotionTemplate`radial-gradient(220px circle at ${glowX} ${glowY}, rgba(61,221,196,0.14), transparent 48%)`
  const enableMotion = hydrated && !reduceMotion
  const tiltX = useTransform(smoothY, [0, 1], enableMotion ? [2.4, -2.4] : [0, 0])
  const tiltY = useTransform(smoothX, [0, 1], enableMotion ? [-2.8, 2.8] : [0, 0])
  const fallbackBackground = 'linear-gradient(180deg,rgba(61,221,196,0.07),transparent 38%)'

  return (
    <m.div
      onMouseMove={(event) => {
        if (!enableMotion) {
          return
        }

        const bounds = event.currentTarget.getBoundingClientRect()
        pointerX.set((event.clientX - bounds.left) / bounds.width)
        pointerY.set((event.clientY - bounds.top) / bounds.height)
      }}
      onMouseLeave={() => {
        pointerX.set(0.5)
        pointerY.set(0.5)
      }}
      style={enableMotion ? { rotateX: tiltX, rotateY: tiltY, transformStyle: 'preserve-3d' } : undefined}
      whileHover={enableMotion ? { y: -6, scale: 1.008 } : undefined}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'surface-panel surface-panel-soft surface-panel-interactive group active:scale-[0.99]',
        className,
      )}
    >
      <m.div
        aria-hidden
        style={{
          background: enableMotion ? borderGlow : fallbackBackground,
        }}
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
      />
      <m.div
        aria-hidden
        style={{ background: enableMotion ? ambientGlow : 'transparent' }}
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
      />
      <m.div
        aria-hidden
        style={{ background: enableMotion ? accentGlow : 'transparent' }}
        className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
      />
      <div className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] border border-[rgba(61,221,196,0.08)] opacity-70" />
      <div className="relative">{children}</div>
    </m.div>
  )
}
