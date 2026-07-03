'use client'

import { cn } from '@/lib/utils'
import { useEffect, useRef, useState, type CSSProperties, type TouchEvent } from 'react'
import type { TypingState } from './use-typing-loop'

type KeyDef = {
  id: string
  /** Ancho relativo (flex). 1 = tecla normal, 1.6/2.2 = teclas anchas, 5.2 = espacio. */
  w?: number
  /** Tecla con glow teal fijo "respirando". */
  lit?: boolean
}

const k = (id: string, w?: number, lit?: boolean): KeyDef => ({ id, w, lit })

/** QWERTY simplificado (layout es-AR con Ñ): fila numérica, QWERTY, ASDF, ZXCV, espacio. */
const ROWS: KeyDef[][] = [
  [k('`'), k('1'), k('2'), k('3', 1, true), k('4'), k('5'), k('6'), k('7'), k('8', 1, true), k('9'), k('0'), k('-'), k('='), k('BACKSPACE', 1.6)],
  [k('TAB', 1.6), k('Q'), k('W', 1, true), k('E'), k('R'), k('T'), k('Y'), k('U'), k('I'), k('O'), k('P'), k('['), k(']')],
  [k('CAPS', 1.8), k('A'), k('S'), k('D', 1, true), k('F'), k('G'), k('H'), k('J'), k('K', 1, true), k('L'), k('Ñ'), k('ENTER', 1.8)],
  [k('LSHIFT', 2.2), k('Z'), k('X'), k('C', 1, true), k('V'), k('B'), k('N'), k('M', 1, true), k(','), k('.'), k('RSHIFT', 2.2)],
  [k('CTRL', 1.4), k('ALT', 1.4), k('SPACE', 5.2, true), k('ALTGR', 1.4), k('FN', 1.4)],
]

function resolvePressedId(pressedKey: string | null): string | null {
  if (!pressedKey) return null
  if (pressedKey === ' ') return 'SPACE'
  return pressedKey.toUpperCase()
}

type KeyboardCssProps = {
  typing: TypingState
  egg?: boolean
  className?: string
}

/** ms que dura hundida la ola de teclas disparada por un tap. */
const TAP_WAVE_MS = 160

/**
 * Teclado 3D construido 100% con CSS (perspective + rotateX/rotateZ + translateZ).
 * Decorativo: se oculta entero del árbol de accesibilidad. La tecla que coincide
 * con `typing.pressedKey` se hunde vía data-pressed + transición CSS corta
 * (nada de springs por tecla: son ~60 nodos). La línea tipeada vive en
 * hero-client: existe igual en modo CSS y en modo WebGL.
 */
export function KeyboardCss({ typing, egg = false, className }: KeyboardCssProps) {
  const pressedId = resolvePressedId(typing.pressedKey)

  // Tap en mobile: ola de presses pseudo-aleatoria cerca del x relativo del
  // touch. Sin preventDefault: el scroll sigue funcionando normal.
  const deckRef = useRef<HTMLDivElement>(null)
  const tapTimer = useRef<number | null>(null)
  const [tapKeys, setTapKeys] = useState<readonly string[]>([])
  useEffect(
    () => () => {
      if (tapTimer.current !== null) window.clearTimeout(tapTimer.current)
    },
    [],
  )
  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const deck = deckRef.current
    const touch = e.touches[0]
    if (!deck || !touch) return
    const rect = deck.getBoundingClientRect()
    if (rect.width === 0) return
    const xRel = Math.min(1, Math.max(0, (touch.clientX - rect.left) / rect.width))
    const rowIndex = 1 + Math.floor(Math.random() * 3) // filas QWERTY/ASDF/ZXCV
    const row = ROWS[rowIndex]
    const center = Math.round(xRel * (row.length - 1))
    const neighbor = ROWS[rowIndex + 1] ?? ROWS[rowIndex - 1]
    const ids = [
      ...[-1, 0, 1].map((d) => row[center + d]?.id),
      ...[0, 1].map((d) => neighbor[Math.min(neighbor.length - 1, Math.max(0, center + d))]?.id),
    ].filter((id): id is string => Boolean(id))
    setTapKeys(ids)
    if (tapTimer.current !== null) window.clearTimeout(tapTimer.current)
    tapTimer.current = window.setTimeout(() => setTapKeys([]), TAP_WAVE_MS)
  }

  return (
    <div
      className={cn('flex flex-col items-center', egg && 'kb-egg', className)}
      aria-hidden="true"
    >
      <div className="kb-stage" onTouchStart={onTouchStart}>
        <div className="kb-float">
          <div className="kb">
            <div ref={deckRef} className="kb-deck">
              {ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="kb-row">
                  {row.map((key, colIndex) => (
                    <span
                      key={key.id}
                      className="kb-key"
                      style={
                        {
                          ...(key.w ? { '--kw': key.w } : null),
                          // Desfasa el ciclo de hue del egg por tecla (barrido).
                          '--ki': rowIndex * 2 + colIndex,
                        } as CSSProperties
                      }
                      data-lit={key.lit || undefined}
                      data-pressed={pressedId === key.id || tapKeys.includes(key.id) || undefined}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
