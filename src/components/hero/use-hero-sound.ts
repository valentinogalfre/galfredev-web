'use client'
import { useEffect, useRef, useState } from 'react'
import { ensureAudioContext, isSoundEnabled, playClick, setSoundEnabled } from './key-sound'
import type { TypingState } from './use-typing-loop'

export type HeroSound = {
  /** Preferencia actual (apagada por defecto; persiste en localStorage). */
  soundOn: boolean
  /** Handler del botón de sonido: alterna, persiste y arma el AudioContext. */
  toggleSound: () => void
}

/**
 * Sonido opcional del hero (mismo patrón que usePhysicalKeys): estado +
 * rehidratación de la preferencia + un click por cada press del loop
 * automático y por cada pulsación física aceptada. hero-client queda solo
 * como render + wiring de hooks.
 */
export function useHeroSound(
  typing: TypingState,
  typingPaused: boolean,
  pressSeq: number,
): HeroSound {
  const [soundOn, setSoundOn] = useState(false)

  useEffect(() => {
    // Rehidrata la preferencia post-mount (SSR no conoce localStorage) y, si el
    // sonido quedó activo de una visita previa, arma el AudioContext en el
    // primer gesto (los browsers lo bloquean sin interacción del usuario).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isSoundEnabled()) setSoundOn(true)
    const arm = () => {
      if (isSoundEnabled()) ensureAudioContext()
    }
    window.addEventListener('pointerdown', arm, { once: true })
    return () => window.removeEventListener('pointerdown', arm)
  }, [])

  // Click por cada press del loop automático… (los refs evitan replays cuando
  // cambia soundOn/typingPaused sin que haya un press nuevo).
  const lastTick = useRef<TypingState | null>(null)
  useEffect(() => {
    if (lastTick.current === typing) return
    lastTick.current = typing
    if (soundOn && !typingPaused && typing.pressedKey) playClick()
  }, [typing, typingPaused, soundOn])
  // …y por cada pulsación física aceptada.
  const lastSeq = useRef(0)
  useEffect(() => {
    if (pressSeq === lastSeq.current) return
    lastSeq.current = pressSeq
    if (soundOn) playClick()
  }, [pressSeq, soundOn])

  const toggleSound = () => {
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    if (next) {
      // Gesto real del usuario: momento seguro para crear/resumir el contexto.
      ensureAudioContext()
      playClick()
    }
  }

  return { soundOn, toggleSound }
}
