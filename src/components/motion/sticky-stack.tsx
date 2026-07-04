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
  // La card i retrocede exactamente mientras la card i+1 le scrollea por
  // encima: ventana [i, i+1] / (total-1). Nunca bajamos la opacity del
  // elemento (haría traslúcida a la card que cubre y el texto de abajo
  // se leería a través); en su lugar un velo oscuro opaco la apaga.
  const start = total > 1 ? index / (total - 1) : 0
  const end = total > 1 ? (index + 1) / (total - 1) : 1
  const scale = useTransform(progress, [start, end], isLast ? [1, 1] : [1, 0.94])
  const veil = useTransform(progress, [start, end], isLast ? [0, 0] : [0, 0.55])

  return (
    <div className="sticky top-[10vh] flex h-screen items-start">
      <motion.div style={{ scale }} className="relative w-full origin-top">
        {children}
        <motion.div
          aria-hidden
          style={{ opacity: veil }}
          className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[#050810]"
        />
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
