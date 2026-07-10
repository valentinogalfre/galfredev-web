'use client'

import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { motion, useReducedMotion } from 'framer-motion'
import { Moon, Zap } from 'lucide-react'
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'

type Palette = 'teal' | 'warm'
type Phase = 'idle' | 'building' | 'built'

/** Duración total del ensamblado (última pieza entra ~1.6s, margen al badge). */
const BUILD_MS = 1900

const ACCENTS: Record<Palette, { dark: string; light: string; soft: string }> = {
  teal: { dark: '#3dddc4', light: '#1f7f73', soft: 'rgba(61,221,196,0.16)' },
  warm: { dark: '#ffb46a', light: '#d97a2b', soft: 'rgba(255,180,106,0.18)' },
}

const SURFACES = {
  dark: {
    canvas: '#0a1322',
    canvasBorder: 'rgba(255,255,255,0.1)',
    block: 'rgba(255,255,255,0.14)',
    blockSoft: 'rgba(255,255,255,0.07)',
    card: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(255,255,255,0.08)',
    hint: 'rgba(255,255,255,0.5)',
  },
  light: {
    canvas: '#eef2f6',
    canvasBorder: 'rgba(13,27,42,0.14)',
    block: 'rgba(13,27,42,0.3)',
    blockSoft: 'rgba(13,27,42,0.13)',
    card: 'rgba(255,255,255,0.92)',
    cardBorder: 'rgba(13,27,42,0.1)',
    hint: 'rgba(13,27,42,0.55)',
  },
} as const

const COPY = {
  es: {
    build: 'Construir el sitio',
    building: 'Construyendo…',
    rebuild: '↺ Reconstruir',
    paletteLabel: 'Paleta',
    paletteTeal: 'Teal',
    paletteWarm: 'Cálida',
    darkToggle: 'Modo oscuro',
    idleHint: 'El lienzo está vacío. Tocá el botón y miralo armarse.',
    badge: 'Lighthouse 98',
  },
  en: {
    build: 'Build the site',
    building: 'Building…',
    rebuild: '↺ Rebuild',
    paletteLabel: 'Palette',
    paletteTeal: 'Teal',
    paletteWarm: 'Warm',
    darkToggle: 'Dark mode',
    idleHint: 'The canvas is empty. Tap the button and watch it assemble.',
    badge: 'Lighthouse 98',
  },
} as const

/** Pieza del mini-sitio: entra con spring y delay propio dentro de la secuencia. */
function Piece({
  delay,
  className,
  style,
  children,
}: {
  delay: number
  className?: string
  style?: CSSProperties
  children?: ReactNode
}) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
      animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 250, damping: 22, delay }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  )
}

/**
 * Un mini-sitio que se construye ante tus ojos: header → hero → cards →
 * footer entran en secuencia con springs, y los toggles de paleta y
 * claro/oscuro lo re-tematizan en vivo. Abstracto (barras y bloques) pero con
 * jerarquía real de landing.
 */
export function WebBuilder({ locale }: { locale: Locale }) {
  const copy = COPY[locale]

  const [phase, setPhase] = useState<Phase>('idle')
  const [palette, setPalette] = useState<Palette>('teal')
  const [dark, setDark] = useState(true)
  // Re-montar las piezas con una key nueva replays la secuencia completa.
  const [buildId, setBuildId] = useState(0)

  const surface = SURFACES[dark ? 'dark' : 'light']
  const accent = ACCENTS[palette][dark ? 'dark' : 'light']
  const accentSoft = ACCENTS[palette].soft

  const startBuild = () => {
    setBuildId((id) => id + 1)
    setPhase('building')
  }

  useEffect(() => {
    if (phase !== 'building') return
    const timeout = setTimeout(() => setPhase('built'), BUILD_MS)
    return () => clearTimeout(timeout)
  }, [phase, buildId])

  const smooth = 'transition-colors duration-500'

  return (
    <div data-testid="micro-demo" className="relative px-4 py-5 sm:px-6 sm:py-6">
      {/* Toolbar: construir + toggles de tema en vivo */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={startBuild}
          disabled={phase === 'building'}
          className={cn(
            'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.985]',
            phase === 'built'
              ? 'border border-[rgba(61,221,196,0.28)] bg-[rgba(61,221,196,0.08)] text-[#8ceada] hover:border-[rgba(61,221,196,0.5)] hover:bg-[rgba(61,221,196,0.14)]'
              : 'bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] text-slate-950 shadow-[0_10px_32px_rgba(31,127,115,0.32)] hover:brightness-110 disabled:opacity-60',
          )}
        >
          {phase === 'idle' ? copy.build : phase === 'building' ? copy.building : copy.rebuild}
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div
            role="group"
            aria-label={copy.paletteLabel}
            className="flex rounded-full border border-white/10 bg-white/[0.04] p-1"
          >
            {(['teal', 'warm'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={palette === option}
                onClick={() => setPalette(option)}
                className={cn(
                  'inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition',
                  palette === option ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/75',
                )}
              >
                <span
                  aria-hidden
                  className="size-2.5 rounded-full"
                  style={{ background: option === 'teal' ? '#3dddc4' : '#ffb46a' }}
                />
                {option === 'teal' ? copy.paletteTeal : copy.paletteWarm}
              </button>
            ))}
          </div>

          <button
            type="button"
            aria-pressed={dark}
            aria-label={copy.darkToggle}
            onClick={() => setDark((value) => !value)}
            className={cn(
              'inline-flex min-h-10 items-center justify-center rounded-full border px-3 transition',
              dark
                ? 'border-[rgba(61,221,196,0.3)] bg-[rgba(61,221,196,0.1)] text-[#8ceada]'
                : 'border-white/10 bg-white/[0.04] text-white/50 hover:text-white/80',
            )}
          >
            <Moon size={15} strokeWidth={2.2} aria-hidden />
          </button>
        </div>
      </div>

      {/* Lienzo: el mini-sitio se ensambla acá (sin overflow-hidden: el badge
          de performance cabalga el borde superior sin tapar el mini-sitio) */}
      <div
        className={cn('relative mt-4 rounded-2xl border', smooth)}
        style={{ background: surface.canvas, borderColor: surface.canvasBorder }}
      >
        {phase === 'idle' ? (
          <div className="flex h-[280px] flex-col items-center justify-center gap-3 px-6 text-center sm:h-[320px]">
            <div
              aria-hidden
              className={cn('flex size-11 items-center justify-center rounded-xl border border-dashed', smooth)}
              style={{ borderColor: surface.block, color: accent }}
            >
              <Zap size={18} strokeWidth={2} />
            </div>
            <p className={cn('max-w-xs text-sm leading-6', smooth)} style={{ color: surface.hint }}>
              {copy.idleHint}
            </p>
          </div>
        ) : (
          <div key={buildId} className="flex h-[280px] flex-col gap-2.5 p-3.5 sm:h-[320px] sm:gap-3 sm:p-5">
            {/* Header: logo + nav + CTA */}
            <Piece
              delay={0.05}
              className={cn('flex items-center gap-3 rounded-lg border px-3 py-2.5', smooth)}
              style={{ background: surface.card, borderColor: surface.cardBorder }}
            >
              <div className={cn('size-2.5 shrink-0 rounded-full', smooth)} style={{ background: accent }} />
              <div className="flex flex-1 items-center gap-2">
                {['16%', '12%', '14%'].map((width, i) => (
                  <div
                    key={i}
                    className={cn('h-1.5 rounded-full', smooth)}
                    style={{ width, background: surface.block }}
                  />
                ))}
              </div>
              <div
                className={cn('h-5 w-14 shrink-0 rounded-full', smooth)}
                style={{ background: accent }}
              />
            </Piece>

            {/* Hero: titular grande + sub + CTA */}
            <Piece
              delay={0.4}
              className={cn('flex flex-1 flex-col items-center justify-center gap-2.5 rounded-lg border px-6', smooth)}
              style={{ background: surface.card, borderColor: surface.cardBorder }}
            >
              <div className="flex w-full items-center justify-center gap-2">
                <div className={cn('h-3 w-[34%] rounded-full', smooth)} style={{ background: surface.block }} />
                <div className={cn('h-3 w-[22%] rounded-full', smooth)} style={{ background: accent }} />
              </div>
              <div className={cn('h-1.5 w-[52%] rounded-full', smooth)} style={{ background: surface.blockSoft }} />
              <div className="mt-1.5 flex items-center gap-2">
                <div className={cn('h-6 w-20 rounded-full', smooth)} style={{ background: accent }} />
                <div
                  className={cn('h-6 w-16 rounded-full border', smooth)}
                  style={{ borderColor: surface.block, background: 'transparent' }}
                />
              </div>
            </Piece>

            {/* 3 cards de features */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {[0, 1, 2].map((index) => (
                <Piece
                  key={index}
                  delay={0.8 + index * 0.15}
                  className={cn('space-y-1.5 rounded-lg border p-2.5', smooth)}
                  style={{ background: surface.card, borderColor: surface.cardBorder }}
                >
                  <div
                    className={cn('size-4 rounded-md', smooth)}
                    style={{ background: index === 0 ? accent : accentSoft }}
                  />
                  <div className={cn('h-1.5 w-3/4 rounded-full', smooth)} style={{ background: surface.block }} />
                  <div className={cn('h-1 w-full rounded-full', smooth)} style={{ background: surface.blockSoft }} />
                  <div className={cn('h-1 w-2/3 rounded-full', smooth)} style={{ background: surface.blockSoft }} />
                </Piece>
              ))}
            </div>

            {/* Footer */}
            <Piece
              delay={1.45}
              className={cn('flex items-center gap-3 rounded-lg border px-3 py-2', smooth)}
              style={{ background: surface.card, borderColor: surface.cardBorder }}
            >
              <div className={cn('size-2 shrink-0 rounded-full', smooth)} style={{ background: accent }} />
              {['14%', '10%', '12%'].map((width, i) => (
                <div
                  key={i}
                  className={cn('h-1 rounded-full', smooth)}
                  style={{ width, background: surface.blockSoft }}
                />
              ))}
              <div className={cn('ml-auto h-1 w-[16%] rounded-full', smooth)} style={{ background: surface.blockSoft }} />
            </Piece>
          </div>
        )}

        {/* Badge de performance al completar el build */}
        {phase === 'built' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 18 }}
            className="absolute -top-3.5 right-4"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-400/95 px-3 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-slate-950 shadow-[0_10px_30px_rgba(52,211,153,0.35)]">
              <Zap size={12} strokeWidth={2.4} aria-hidden />
              {copy.badge}
            </span>
          </motion.div>
        ) : null}
      </div>
    </div>
  )
}
