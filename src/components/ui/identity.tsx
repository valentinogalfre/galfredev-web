import type { AboutIdentity } from '@/types/content'
import { cn } from '@/lib/utils'

/**
 * Placa de identidad profesional (rol · base · disponibilidad) y firma de stack.
 * Se usan en el teaser de la home y en el hero de Sobre mí: viven acá para que
 * ambos lugares digan exactamente lo mismo, con el mismo tratamiento visual.
 */

/** Pills de identidad. `status` es opcional: en el teaser de la home se omite. */
export function IdentityPills({
  identity,
  withStatus = false,
  className,
  style,
}: {
  identity: AboutIdentity
  withStatus?: boolean
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div style={style} className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="inline-flex items-center rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(61,221,196,0.08)] px-3.5 py-1.5 text-[13px] font-medium text-[#8ceada]">
        {identity.role}
      </span>
      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[13px] font-medium text-white/70">
        {identity.location}
      </span>
      {withStatus ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[13px] font-medium text-white/70">
          <span
            aria-hidden
            className="inline-flex h-1.5 w-1.5 rounded-full bg-[#3dddc4] shadow-[0_0_10px_rgba(61,221,196,0.9)]"
          />
          {identity.status}
        </span>
      ) : null}
    </div>
  )
}

/**
 * Firma de stack en mono, mismo lenguaje que las marquees del hero y el footer.
 * Cada item lleva SU separador adentro del mismo flex: el wrap solo puede caer
 * entre items, así que una línea nunca arranca con un '·' huérfano.
 */
export function StackStrip({
  items,
  className,
  style,
}: {
  items: string[]
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <p
      style={style}
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45',
        className,
      )}
    >
      {items.map((item, index) => (
        <span key={item} className="flex items-center gap-3">
          <span>{item}</span>
          {index < items.length - 1 ? (
            <span aria-hidden className="text-[rgba(61,221,196,0.55)]">
              ·
            </span>
          ) : null}
        </span>
      ))}
    </p>
  )
}
