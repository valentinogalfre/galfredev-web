'use client'

import { cn } from '@/lib/utils'
import { Children, useLayoutEffect, type CSSProperties, type ReactNode } from 'react'
import { useRevealOnView } from './reveal'

type StaggerRevealProps = {
  children: ReactNode
  className?: string
  /** Segundos antes del primer item. */
  delay?: number
  /** Segundos entre items. */
  stagger?: number
  id?: string
}

/**
 * Contenedor que revela sus StaggerItem en cascada al entrar a la vista
 * (mismo motor que Reveal: visible sin JS, solo se arma lo que no se ve).
 * El índice de cada item sale del orden en el DOM → `--stagger-i`.
 */
export function StaggerReveal({ children, className, delay = 0, stagger = 0.08, id }: StaggerRevealProps) {
  const ref = useRevealOnView<HTMLDivElement>('stagger')
  const count = Children.count(children)

  // Solo escrituras (sin medir) y solo cuando cambia la cantidad de items.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    Array.from(el.children).forEach((child, index) => {
      ;(child as HTMLElement).style.setProperty('--stagger-i', String(index))
    })
  }, [ref, count])

  return (
    <div
      ref={ref}
      id={id}
      className={cn(className)}
      style={
        {
          '--stagger-delay': `${delay}s`,
          '--stagger-step': `${stagger}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div data-stagger-item="" className={cn(className)}>
      {children}
    </div>
  )
}
