'use client'

import { cn } from '@/lib/utils'
import type { CSSProperties, ReactNode } from 'react'

type MarqueeProps = {
  children: ReactNode
  /** Seconds per full loop. */
  speed?: number
  reverse?: boolean
  /** Pausar al hover (default). Con false, la banda nunca se detiene. */
  pauseOnHover?: boolean
  className?: string
}

export function Marquee({
  children,
  speed = 30,
  reverse = false,
  pauseOnHover = true,
  className,
}: MarqueeProps) {
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
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true" inert>
          {children}
        </div>
      </div>
    </div>
  )
}
