import { getDictionary } from '@/lib/i18n'
import type { Locale, ServiceId } from '@/types/content'
import { MicroDemoLoader } from './loader'

type MicroDemoSlotProps = {
  id: ServiceId
  locale: Locale
}

/**
 * Slot de la micro-demo por servicio: switch real de demos interactivas para
 * los 5 servicios (Task 21 completó la suite) con lazy-load por chunk.
 * Contrato estable: props { id, locale }, data-testid="micro-demo-slot" en el
 * elemento raíz y data-testid="micro-demo" en la raíz de cada demo live.
 *
 * El heading (demoTitle + demoHint) vive en ServicePage, justo arriba del
 * slot — acá el shell solo repite el nombre en la barra tipo ventana.
 */
export function MicroDemoSlot({ id, locale }: MicroDemoSlotProps) {
  const service = getDictionary(locale).services[id]

  return (
    <div
      data-testid="micro-demo-slot"
      className="relative overflow-hidden rounded-[2rem] border border-[rgba(61,221,196,0.16)] bg-[linear-gradient(180deg,rgba(10,20,34,0.9),rgba(6,11,20,0.96))] shadow-[var(--surface-shadow)]"
    >
      {/* Deco: grilla tenue + glow radial teal, misma familia visual que los frames */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% -20%, rgba(31,127,115,0.22), transparent 60%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
          maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.85), rgba(0,0,0,0.25))',
        }}
      />

      {/* Barra superior tipo ventana: ancla el nombre de la demo del servicio */}
      <div className="relative flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3 sm:px-5">
        <span aria-hidden className="relative inline-flex size-2 shrink-0">
          <span className="absolute inline-flex size-full rounded-full bg-[#3dddc4] opacity-60 motion-safe:animate-ping" />
          <span className="relative inline-flex size-2 rounded-full bg-[#3dddc4] shadow-[0_0_10px_#3dddc4]" />
        </span>
        <span className="truncate font-mono text-[11px] tracking-[0.14em] text-white/50">
          {service.demoTitle}
        </span>
      </div>

      <div className="relative">
        <MicroDemoLoader id={id} locale={locale} />
      </div>
    </div>
  )
}
