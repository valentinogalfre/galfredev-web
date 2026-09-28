'use client'

import { useReducedMotion } from 'framer-motion'
import { useState, useSyncExternalStore } from 'react'

const subscribeNoop = () => () => undefined

/**
 * false en el server y durante la hidratación (React usa el snapshot del
 * server para no romper el match), true después y en todo montaje cliente.
 */
export function useHydrated() {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}

/**
 * true si el componente se montó hidratando el HTML del server (primera
 * carga), false si se montó en el cliente (navegación, un menú que se abre).
 * Se congela en el primer render.
 */
export function useMountedFromServer() {
  const hydrated = useHydrated()
  const [fromServer] = useState(!hydrated)
  return fromServer
}

/**
 * prefers-reduced-motion sin mismatch de hidratación: framer lee matchMedia
 * ya en el primer render del cliente (el server no puede), así que ramificar
 * markup con useReducedMotion() rompía la hidratación (#418) justo para quien
 * pide menos movimiento. Acá vale false hasta hidratar y el valor real después.
 */
export function useSafeReducedMotion() {
  const hydrated = useHydrated()
  const reduced = useReducedMotion()
  return hydrated && reduced === true
}
