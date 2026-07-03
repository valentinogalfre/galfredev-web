'use client'
import { useEffect, useRef, useState } from 'react'
import { ensureAudioContext, isSoundEnabled } from './key-sound'

/** ms sin teclas físicas hasta que el loop automático retoma. */
const PAUSE_MS = 4000
/** ms que dura el light show del easter egg. */
const EGG_MS = 3000
const BUFFER_MAX = 24
const EGG_WORD = 'GALFREDEV'

export type PhysicalKeysState = {
  /** Tecla presionada AHORA, normalizada al id del layout (null al soltar). */
  liveKey: string | null
  /** Últimos ~24 chars tipeados (solo letras/números/espacio), en mayúsculas. */
  buffer: string
  /** true desde la última tecla física hasta PAUSE_MS después. */
  typingPaused: boolean
  /** Contador de pulsaciones aceptadas: identidad de cada press (sonido/ripple). */
  pressSeq: number
  /** Light show activo (el buffer terminó en 'galfredev' hace < EGG_MS). */
  egg: boolean
}

const IDLE_STATE: PhysicalKeysState = {
  liveKey: null,
  buffer: '',
  typingPaused: false,
  pressSeq: 0,
  egg: false,
}

/** Normaliza e.key al id del layout del teclado; teclas sin mapeo → null. */
function mapKey(key: string): string | null {
  if (key === ' ') return 'SPACE'
  if (key === 'Backspace') return 'BACKSPACE'
  if (key === 'Enter') return 'ENTER'
  if (key.length === 1 && /[a-zñA-ZÑ0-9]/.test(key)) return key.toUpperCase()
  return null
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
}

/**
 * Teclado físico global para el hero: keydown/keyup en window, activo solo
 * mientras `enabled` (el caller lo deriva de un IntersectionObserver sobre el
 * section del hero). Ignora inputs/textarea/select/contenteditable y cualquier
 * combinación con meta/ctrl/alt (no rompe ⌘K ni el form de contacto).
 */
export function usePhysicalKeys(enabled: boolean): PhysicalKeysState {
  const [state, setState] = useState<PhysicalKeysState>(IDLE_STATE)
  // Fuente de verdad del buffer para los handlers (evita updaters impuros).
  const bufRef = useRef('')
  const pauseTimer = useRef<number | null>(null)
  const eggTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled) return

    const renewPause = () => {
      if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current)
      pauseTimer.current = window.setTimeout(() => {
        pauseTimer.current = null
        bufRef.current = ''
        setState((s) => ({ ...s, liveKey: null, buffer: '', typingPaused: false }))
      }, PAUSE_MS)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isEditableTarget(e.target)) return
      const id = mapKey(e.key)
      if (!id) return
      renewPause()
      // Auto-repeat del OS: mantiene la pausa pero no re-dispara press/ripple
      // (el hundimiento sostenido lo maneja `held` en el estado efectivo).
      if (e.repeat) return
      // Primer gesto real del usuario: habilita el AudioContext si corresponde.
      if (isSoundEnabled()) ensureAudioContext()

      let buffer = bufRef.current
      if (id === 'BACKSPACE') buffer = buffer.slice(0, -1)
      else if (id !== 'ENTER') buffer = (buffer + (id === 'SPACE' ? ' ' : id)).slice(-BUFFER_MAX)
      bufRef.current = buffer

      const hitEgg = buffer.endsWith(EGG_WORD)
      if (hitEgg) {
        if (eggTimer.current !== null) window.clearTimeout(eggTimer.current)
        eggTimer.current = window.setTimeout(() => {
          eggTimer.current = null
          setState((s) => ({ ...s, egg: false }))
        }, EGG_MS)
      }
      setState((s) => ({
        liveKey: id,
        buffer,
        typingPaused: true,
        pressSeq: s.pressSeq + 1,
        egg: hitEgg || s.egg,
      }))
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const id = mapKey(e.key)
      if (!id) return
      setState((s) => (s.liveKey === id ? { ...s, liveKey: null } : s))
    }

    // Alt-tab/cmd-tab con una tecla sostenida: el keyup nunca llega y la tecla
    // quedaba hundida hasta el unpause (~4s). Al perder foco se suelta ya mismo.
    const onBlur = () => {
      setState((s) => (s.liveKey !== null ? { ...s, liveKey: null } : s))
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      if (pauseTimer.current !== null) window.clearTimeout(pauseTimer.current)
      if (eggTimer.current !== null) window.clearTimeout(eggTimer.current)
      pauseTimer.current = null
      eggTimer.current = null
      bufRef.current = ''
      // Hero fuera de viewport (o unmount): el loop automático retoma limpio.
      setState((s) => (s.typingPaused || s.liveKey || s.egg ? { ...s, ...IDLE_STATE, pressSeq: s.pressSeq } : s))
    }
  }, [enabled])

  return state
}
