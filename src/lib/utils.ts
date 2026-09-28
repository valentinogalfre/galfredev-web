import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrencyArs(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Variante compacta («$289 k», «$3,5 M») para espacios angostos (las
 * result-cards de la calculadora ROI en mobile). La cifra completa sigue
 * visible en la card CTA y en el mensaje de WhatsApp.
 */
export function formatCurrencyArsCompact(value: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    notation: 'compact',
    // Mínimo explícito: con solo el máximo, el default de decimales depende de
    // la versión de V8. Node 22 (el build en Railway) daba «$289,0 k» y el
    // navegador «$289 k» → texto distinto entre server y cliente (React #418).
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value)
}
