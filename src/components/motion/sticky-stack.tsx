'use client'

import { cn } from '@/lib/utils'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useRef, useSyncExternalStore, type ReactNode } from 'react'

type StickyStackProps = {
  items: ReactNode[]
  className?: string
}

function subscribeToMediaQuery(query: string, callback: () => void) {
  const mql = window.matchMedia(query)
  mql.addEventListener('change', callback)
  return () => mql.removeEventListener('change', callback)
}

function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (callback) => subscribeToMediaQuery(query, callback),
    () => window.matchMedia(query).matches,
    () => false,
  )
}

function StackCard({
  children,
  index,
  total,
  progress,
}: {
  children: ReactNode
  index: number
  total: number
  progress: MotionValue<number>
}) {
  const isLast = index === total - 1
  // Each card starts receding once it is pinned and the next card scrolls over it.
  const start = index / total
  const scale = useTransform(progress, [start, 1], isLast ? [1, 1] : [1, 0.92])
  const opacity = useTransform(progress, [start, 1], isLast ? [1, 1] : [1, 0.45])

  return (
    <div className="sticky top-[10vh] flex h-screen items-start">
      <motion.div style={{ scale, opacity }} className="w-full origin-top">
        {children}
      </motion.div>
    </div>
  )
}

export function StickyStack({ items, className }: StickyStackProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const shortViewport = useMediaQuery('(max-height: 699px)')
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  })

  if (reduceMotion || shortViewport) {
    return (
      <div ref={ref} className={cn('relative flex flex-col gap-8', className)}>
        {items.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
    )
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
      {items.map((item, index) => (
        <StackCard key={index} index={index} total={items.length} progress={scrollYProgress}>
          {item}
        </StackCard>
      ))}
    </div>
  )
}
