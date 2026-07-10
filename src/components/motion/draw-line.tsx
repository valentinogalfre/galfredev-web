'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

/**
 * Línea vertical que se "dibuja" al scrollear (scaleY driven by scroll).
 * Nota: se evita SVG pathLength — con preserveAspectRatio="none" +
 * non-scaling-stroke, Chromium rompe la normalización del dasharray y la
 * línea sale punteada.
 */
export function DrawLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.5'],
  })
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-y-0 w-0.5', className)}
    >
      {/* Riel tenue de fondo */}
      <div className="absolute inset-0 bg-white/6" />
      {/* Trazo que se dibuja con el scroll */}
      <motion.div
        className="absolute inset-0 origin-top bg-[linear-gradient(180deg,rgba(61,221,196,0.75),rgba(31,127,115,0.55))] shadow-[0_0_12px_rgba(61,221,196,0.35)]"
        style={{ scaleY: reduceMotion ? 1 : scaleY }}
      />
    </div>
  )
}
