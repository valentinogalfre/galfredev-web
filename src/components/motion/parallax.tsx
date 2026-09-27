'use client'

import { cn } from '@/lib/utils'
import { motion, useMotionValue, useScroll, useTransform } from 'framer-motion'
import { useEffect, useRef, type ReactNode } from 'react'
import { useSafeReducedMotion } from './hydration'

type ParallaxProps = {
  children: ReactNode
  /** Max displacement in px (travels from +offset to -offset). */
  offset?: number
  className?: string
}

export function Parallax({ children, offset = 40, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useSafeReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  // El `y` queda SIEMPRE ligado: el server lo SSRea con el offset inicial y,
  // si después se pasa el style a undefined (reduced-motion), framer nunca
  // reescribe ese transform y el contenido quedaba corrido para siempre.
  // Con reduced-motion el factor baja a 0 y framer lo lleva a translateY(0).
  const factor = useMotionValue(1)
  useEffect(() => {
    factor.set(reduceMotion ? 0 : 1)
  }, [reduceMotion, factor])
  const y = useTransform([scrollYProgress, factor], ([progress, f]: number[]) => (offset - 2 * offset * progress) * f)

  return (
    <motion.div ref={ref} style={{ y }} className={cn('relative', className)}>
      {children}
    </motion.div>
  )
}
