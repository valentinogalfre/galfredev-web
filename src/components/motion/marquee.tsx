'use client'

import { cn } from '@/lib/utils'
import { Fragment, type CSSProperties, type ReactNode } from 'react'

type MarqueeProps = {
  children: ReactNode
  /** Seconds per full loop. */
  speed?: number
  reverse?: boolean
  /** Pausar al hover (default). Con false, la banda nunca se detiene. */
  pauseOnHover?: boolean
  /**
   * Veces que se repite el contenido DENTRO de cada mitad del loop. El loop
   * (translateX -50%) solo es continuo si una mitad es más ancha que el
   * contenedor: con contenido corto (p. ej. la banda del footer) subí esto
   * hasta cubrir cualquier pantalla — si una mitad queda angosta, aparece un
   * hueco al final de cada vuelta.
   */
  repeat?: number
  className?: string
}

export function Marquee({
  children,
  speed = 30,
  reverse = false,
  pauseOnHover = true,
  repeat = 1,
  className,
}: MarqueeProps) {
  const copies = Array.from({ length: Math.max(1, repeat) }, (_, i) => (
    <Fragment key={i}>{children}</Fragment>
  ))
  return (
    <div className={cn('flex overflow-hidden', className)}>
      <div
        className={cn(
          'animate-marquee flex w-max shrink-0 items-center',
          !pauseOnHover && 'marquee-no-pause',
        )}
        style={
          {
            '--marquee-duration': `${speed}s`,
            animationDirection: reverse ? 'reverse' : undefined,
          } as CSSProperties
        }
      >
        <div className="flex shrink-0 items-center">{copies}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true" inert>
          {copies}
        </div>
      </div>
    </div>
  )
}
