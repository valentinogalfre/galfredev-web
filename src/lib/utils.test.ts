import { describe, it, expect } from 'vitest'
import { formatCurrencyArsCompact } from './utils'

// Contrato: el formato compacto es idéntico en cualquier motor. La home es
// estática: el server (Node del build) y el navegador tienen que producir el
// mismo texto o React descarta el HTML al hidratar (#418). Node 22 ponía un
// decimal de más («$289,0 k») si no se fija el mínimo.
// Intl separa la unidad con un espacio duro (U+00A0).
const NBSP = '\u00a0'

describe('formatCurrencyArsCompact', () => {
  it('no agrega decimales en cero', () => {
    expect(formatCurrencyArsCompact(289_000)).toBe(`$289${NBSP}k`)
    expect(formatCurrencyArsCompact(340_000)).toBe(`$340${NBSP}k`)
  })

  it('conserva un decimal cuando hace falta', () => {
    expect(formatCurrencyArsCompact(3_468_000)).toBe(`$3,5${NBSP}M`)
  })
})
