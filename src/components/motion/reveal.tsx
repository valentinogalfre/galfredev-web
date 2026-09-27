'use client'

import { cn } from '@/lib/utils'
import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import { useMountedFromServer } from './hydration'

/** Entra a la vista cuando su borde superior pasa el 85% del viewport. */
const REVEAL_ROOT_MARGIN = '0px 0px -15% 0px'

/**
 * Motor común de Reveal y StaggerReveal. El HTML del server llega VISIBLE:
 * sin JS no se oculta nada. Solo se "arma" (`data-<attr>="armed"`: oculto) lo
 * que todavía no se ve, y un IntersectionObserver lo pasa a "in" para que la
 * transición CSS de globals.css lo muestre. Con prefers-reduced-motion no se
 * arma nada.
 *
 * - Navegación cliente: todo arranca armado (solo escritura, sin medir).
 * - Hidratación (primera carga): no se mide nada en el commit — leer la
 *   posición de ~30 secciones intercalando escrituras forzaba un layout por
 *   cada una y demoraba todo el arranque. Un IO sin margen decide async: lo
 *   que no toca el viewport se arma (está fuera de pantalla: sin flash) y lo
 *   visible queda como vino del server.
 *
 * Antes framer leía `initial` recién hidratado (false) y ninguna sección
 * animaba en la primera visita: solo después de navegar.
 */
export function useRevealOnView<T extends HTMLElement>(attr: 'reveal' | 'stagger') {
  const ref = useRef<T>(null)
  const fromServer = useMountedFromServer()

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const reveal = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.dataset[attr] = 'in'
        reveal.disconnect()
      },
      { rootMargin: REVEAL_ROOT_MARGIN },
    )

    if (!fromServer) {
      el.dataset[attr] = 'armed'
      reveal.observe(el)
      return () => reveal.disconnect()
    }

    const gate = new IntersectionObserver(([entry]) => {
      gate.disconnect()
      if (entry.isIntersecting) return
      el.dataset[attr] = 'armed'
      reveal.observe(el)
    })
    gate.observe(el)
    return () => {
      gate.disconnect()
      reveal.disconnect()
    }
  }, [attr, fromServer])

  return ref
}

type RevealProps = {
  children: ReactNode
  className?: string
  /** Segundos. */
  delay?: number
  /** Desplazamiento inicial en px. */
  y?: number
  x?: number
  id?: string
  variant?: 'hero' | 'section' | 'surface'
}

const VARIANTS = {
  hero: { y: 24, duration: 0.8 },
  section: { y: 16, duration: 0.65 },
  surface: { y: 12, duration: 0.6 },
} as const

export function Reveal({ children, className, delay = 0, y, x = 0, id, variant = 'section' }: RevealProps) {
  const ref = useRevealOnView<HTMLDivElement>('reveal')
  const config = VARIANTS[variant]

  return (
    <div
      ref={ref}
      id={id}
      className={cn(className)}
      style={
        {
          '--reveal-y': `${y ?? config.y}px`,
          '--reveal-x': `${x}px`,
          '--reveal-delay': `${delay}s`,
          '--reveal-duration': `${config.duration}s`,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}
