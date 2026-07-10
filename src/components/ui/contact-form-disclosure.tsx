'use client'

import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useId, useRef, useState, type ReactNode } from 'react'

/**
 * Client component: en mobile el form de contacto arranca COLAPSADO — el CTA
 * protagonista es WhatsApp — y se expande con «Prefiero el formulario». En
 * lg+ el form queda siempre visible, como hasta ahora (el toggle no existe).
 *
 * La altura se anima con grid-template-rows 0fr→1fr (CSS puro): es SSR-safe
 * (las clases server-rendered garantizan colapsado en mobile sin flash
 * pre-hidratación, sin pelear estilos inline) y respeta reduced-motion vía
 * motion-reduce. `invisible` saca el contenido colapsado del tab-order y del
 * árbol de accesibilidad. Al asentarse la expansión, overflow pasa a visible
 * para no recortar el dropdown del select ni el glow de focus del form.
 */
export function ContactFormDisclosure({
  toggleLabel,
  children,
}: {
  toggleLabel: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [settled, setSettled] = useState(false)
  const panelId = useId()
  const timeoutRef = useRef<number>(0)

  function handleOpen() {
    setOpen(true)
    window.clearTimeout(timeoutRef.current)
    // Fallback del transitionend (reduced-motion: transition-none no dispara).
    timeoutRef.current = window.setTimeout(() => setSettled(true), 650)
  }

  return (
    <div>
      <button
        type="button"
        data-testid="contact-form-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={handleOpen}
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white/82 transition duration-300 hover:border-[rgba(61,221,196,0.3)] hover:text-white lg:hidden',
          open && 'hidden',
        )}
      >
        {toggleLabel}
        <ChevronDown size={15} aria-hidden className="text-[var(--color-accent)]" />
      </button>

      <div
        id={panelId}
        onTransitionEnd={(event) => {
          // Solo la transición de altura del propio panel (las de los hijos
          // burbujean y asentarían el overflow a mitad de la expansión).
          if (open && event.target === event.currentTarget) setSettled(true)
        }}
        className={cn(
          'grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none lg:grid-rows-[1fr]',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
        )}
      >
        <div
          className={cn(
            'min-h-0 transition-opacity duration-300 motion-reduce:transition-none lg:visible lg:overflow-visible lg:opacity-100',
            open ? 'visible opacity-100' : 'invisible opacity-0',
            open && settled ? 'overflow-visible' : 'overflow-hidden',
          )}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
