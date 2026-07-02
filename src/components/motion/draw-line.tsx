'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function DrawLine({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.5'],
  })
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-y-0', className)}
    >
      <svg
        width="2"
        height="100%"
        viewBox="0 0 2 100"
        preserveAspectRatio="none"
        fill="none"
        className="h-full"
      >
        <motion.path
          d="M1 0 L1 100"
          stroke="var(--color-accent)"
          strokeWidth={2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          style={{ pathLength: reduceMotion ? 1 : pathLength }}
        />
      </svg>
    </div>
  )
}
