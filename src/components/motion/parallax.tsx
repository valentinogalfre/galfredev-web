'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef, type ReactNode } from 'react'

type ParallaxProps = {
  children: ReactNode
  /** Max displacement in px (travels from +offset to -offset). */
  offset?: number
  className?: string
}

export function Parallax({ children, offset = 40, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset])

  return (
    <motion.div ref={ref} style={reduceMotion ? undefined : { y }} className={cn('relative', className)}>
      {children}
    </motion.div>
  )
}
