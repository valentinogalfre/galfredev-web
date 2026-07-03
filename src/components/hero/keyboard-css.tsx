'use client'

import { cn } from '@/lib/utils'
import type { CSSProperties } from 'react'
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
  className?: string
}

/**
 * Teclado 3D construido 100% con CSS (perspective + rotateX/rotateZ + translateZ).
 * Decorativo: se oculta entero del árbol de accesibilidad. La tecla que coincide
 * con `typing.pressedKey` se hunde vía data-pressed + transición CSS corta
 * (nada de springs por tecla: son ~60 nodos). La línea tipeada vive en
 * hero-client: existe igual en modo CSS y en modo WebGL.
 */
export function KeyboardCss({ typing, className }: KeyboardCssProps) {
  const pressedId = resolvePressedId(typing.pressedKey)

  return (
    <div className={cn('flex flex-col items-center', className)} aria-hidden="true">
      <div className="kb-stage">
        <div className="kb-float">
          <div className="kb">
            <div className="kb-deck">
              {ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="kb-row">
                  {row.map((key) => (
                    <span
                      key={key.id}
                      className="kb-key"
                      style={key.w ? ({ '--kw': key.w } as CSSProperties) : undefined}
                      data-lit={key.lit || undefined}
                      data-pressed={pressedId === key.id || undefined}
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
