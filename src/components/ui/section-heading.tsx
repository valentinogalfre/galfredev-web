'use client'

import { cn } from '@/lib/utils'
import { useInView } from 'framer-motion'
import { useRef } from 'react'

type SectionHeadingProps = {
  eyebrow: string
  title: string
  description?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
}: SectionHeadingProps) {
  // La línea del kicker crece (scaleX 0→1) recién cuando la sección entra al
  // viewport, una sola vez. El atributo gatea la animación CSS pausada de
  // .section-kicker[data-kicker-reveal] (reduced-motion la anula: línea fija).
  const kickerRef = useRef<HTMLParagraphElement>(null)
  const inView = useInView(kickerRef, { once: true, margin: '0px 0px -10% 0px' })

  return (
    <div
      className={cn(
        'max-w-3xl space-y-6',
        align === 'center' && 'mx-auto text-center',
      )}
    >
      <p
        ref={kickerRef}
        data-kicker-reveal={inView ? 'in' : ''}
        className={cn(
          'section-kicker',
          align === 'center' && 'justify-center',
        )}
      >
        {eyebrow}
      </p>
      <div className="space-y-4">
        <h2 className="text-balance text-3xl font-semibold leading-[0.96] tracking-[-0.07em] text-white sm:text-4xl lg:text-[3.35rem]">
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              'max-w-2xl text-pretty text-base leading-8 text-[var(--text-faint)] sm:text-lg',
              align === 'center' && 'mx-auto',
            )}
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
