'use client'

import { cn } from '@/lib/utils'
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useRef, useSyncExternalStore, type ReactNode } from 'react'

type ProjectsDeckProps = {
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

function DeckCard({
  children,
  index,
  total,
  progress,
  stackAnimated,
}: {
  children: ReactNode
  index: number
  total: number
  progress: MotionValue<number>
  stackAnimated: boolean
}) {
  const isLast = index === total - 1
  // Desktop (sticky stack): la card i retrocede exactamente mientras la card
  // i+1 le scrollea por encima: ventana [i, i+1] / (total-1). Nunca bajamos la
  // opacity del elemento (haría traslúcida a la card que cubre); un velo
  // oscuro opaco la apaga. En mobile (carousel) no hay transformación.
  const start = total > 1 ? index / (total - 1) : 0
  const end = total > 1 ? (index + 1) / (total - 1) : 1
  const scale = useTransform(progress, [start, end], isLast ? [1, 1] : [1, 0.94])
  const veil = useTransform(progress, [start, end], isLast ? [0, 0] : [0, 0.55])

  return (
    <div
      className={cn(
        // Mobile <lg: slide del carousel snap con peek de la siguiente card.
        'w-[80vw] max-w-[430px] shrink-0 snap-start lg:w-auto lg:max-w-none',
        stackAnimated
          ? 'lg:sticky lg:top-[10vh] lg:flex lg:h-screen lg:items-start'
          : 'lg:static lg:block lg:h-auto',
      )}
    >
      <motion.div
        style={{ scale: stackAnimated ? scale : 1 }}
        className="relative h-full w-full origin-top lg:h-auto"
      >
        {children}
        <motion.div
          aria-hidden
          style={{ opacity: stackAnimated ? veil : 0 }}
          className="pointer-events-none absolute inset-0 hidden rounded-[2rem] bg-[#050810] lg:block"
        />
      </motion.div>
    </div>
  )
}

/**
 * Layout responsive de los casos: UNA sola lista en el DOM (los e2e cuentan
 * las 4 cards) que cambia de comportamiento por breakpoint.
 *
 * - Mobile <lg: carousel horizontal con scroll-snap (momentum nativo) +
 *   barra de progreso animada que refleja la posición del scroll.
 * - Desktop lg+: sticky stack idéntico al aprobado (cada card se pinnea y la
 *   siguiente scrollea por encima). Con reduced-motion o viewport bajo, las
 *   cards quedan en columna simple, como antes.
 */
export function ProjectsDeck({ items, className }: ProjectsDeckProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()
  const shortViewport = useMediaQuery('(max-height: 699px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const stackAnimated = isDesktop && !reduceMotion && !shortViewport

  // Progreso vertical de la página sobre la lista (motor del sticky stack).
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start start', 'end end'],
  })

  // Progreso horizontal DENTRO de la lista (motor del indicador del carousel).
  const { scrollXProgress } = useScroll({ container: listRef })
  const smoothX = useSpring(scrollXProgress, { stiffness: 260, damping: 34 })
  // Segmento móvil de 1/total del track: translateX 0% → (total-1)*100%.
  const thumbX = useTransform(
    reduceMotion ? scrollXProgress : smoothX,
    [0, 1],
    ['0%', `${(items.length - 1) * 100}%`],
  )

  return (
    <div className={className}>
      <div
        ref={listRef}
        className={cn(
          '-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6',
          'lg:mx-0 lg:block lg:overflow-visible lg:px-0 lg:pb-0',
          !stackAnimated && 'lg:space-y-8',
        )}
      >
        {items.map((item, index) => (
          <DeckCard
            key={index}
            index={index}
            total={items.length}
            progress={scrollYProgress}
            stackAnimated={stackAnimated}
          >
            {item}
          </DeckCard>
        ))}
      </div>

      {/* Indicador de posición del carousel (solo mobile) */}
      <div
        aria-hidden
        className="mx-auto mt-4 h-1 w-28 overflow-hidden rounded-full bg-white/10 lg:hidden"
      >
        <motion.div
          style={{ x: thumbX, width: `${100 / items.length}%` }}
          className="h-full rounded-full bg-gradient-to-r from-[#3dddc4] to-[#2a9184] shadow-[0_0_12px_rgba(61,221,196,0.55)]"
        />
      </div>
    </div>
  )
}
