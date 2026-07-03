'use client'

import type { CommandPaletteProps } from '@/components/command/command-palette'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'

const CommandPalette = dynamic(
  () => import('@/components/command/command-palette').then((mod) => mod.CommandPalette),
  { ssr: false },
)

/**
 * Gate lazy de la palette: cmdk (+ radix dialog) NO viaja en el first-load de
 * ninguna ruta; el chunk se carga recién en el primer ⌘K / Ctrl+K o
 * 'open-command-palette'. Después del primer trigger la palette queda montada
 * y maneja sus propios atajos.
 */
export function CommandPaletteLoader(props: CommandPaletteProps) {
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    if (requested) return

    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setRequested(true)
      }
    }
    const onOpenEvent = () => setRequested(true)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('open-command-palette', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('open-command-palette', onOpenEvent)
    }
  }, [requested])

  if (!requested) return null

  return <CommandPalette {...props} initialOpen />
}
