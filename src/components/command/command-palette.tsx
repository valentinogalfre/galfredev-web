'use client'

import { switchByMap, type SwitchMap } from '@/lib/route-pairs'
import type { Locale } from '@/types/content'
import { Command } from 'cmdk'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export type PaletteItem = {
  group: 'pages' | 'actions'
  label: string
  href?: string
  action?: 'whatsapp' | 'switch-locale'
  keywords?: string
}

export type CommandPaletteProps = {
  locale: Locale
  placeholder: string
  groupLabels: { pages: string; actions: string }
  items: PaletteItem[]
  whatsappUrl: string
  switchMap: SwitchMap
  targetHome: string
  /** Abre la palette al montar (la usa el loader lazy, que monta recién en el primer trigger). */
  initialOpen?: boolean
}

const ITEM_CLASS =
  'flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/72 transition-colors duration-150 data-[selected=true]:bg-[rgba(61,221,196,0.1)] data-[selected=true]:text-white'

function PaletteGroup({
  heading,
  items,
  onRun,
}: {
  heading: string
  items: PaletteItem[]
  onRun: (item: PaletteItem) => void
}) {
  if (items.length === 0) return null
  return (
    <Command.Group
      heading={heading}
      className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:text-[0.68rem] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.18em] [&_[cmdk-group-heading]]:text-white/40"
    >
      {items.map((item) => (
        <Command.Item
          key={`${item.group}:${item.href ?? item.action}:${item.label}`}
          value={item.label}
          keywords={item.keywords ? [item.keywords] : undefined}
          onSelect={() => onRun(item)}
          className={ITEM_CLASS}
        >
          {item.label}
        </Command.Item>
      ))}
    </Command.Group>
  )
}

export function CommandPalette({
  locale,
  placeholder,
  groupLabels,
  items,
  whatsappUrl,
  switchMap,
  targetHome,
  initialOpen = false,
}: CommandPaletteProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(initialOpen)

  // Cierra al navegar (patrón "adjust state during render", como el header).
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    const onOpenEvent = () => setOpen(true)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('open-command-palette', onOpenEvent)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('open-command-palette', onOpenEvent)
    }
  }, [])

  const run = (item: PaletteItem) => {
    setOpen(false)
    if (item.href) {
      router.push(item.href)
      return
    }
    if (item.action === 'whatsapp') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
      return
    }
    if (item.action === 'switch-locale') {
      router.push(switchByMap(switchMap, pathname, targetHome))
    }
  }

  const ariaLabel = locale === 'es' ? 'Buscador rápido' : 'Quick search'
  const emptyLabel = locale === 'es' ? 'Sin resultados.' : 'No results.'

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={ariaLabel}
      data-testid="command-palette"
      overlayClassName="fixed inset-0 z-[90] bg-black/60 backdrop-blur"
      contentClassName="fixed inset-x-0 bottom-0 z-[95] outline-none sm:inset-x-0 sm:bottom-auto sm:top-[16vh] sm:mx-auto sm:w-[calc(100%-2rem)] sm:max-w-lg"
      className="flex max-h-[70dvh] flex-col overflow-hidden rounded-t-2xl border border-[var(--surface-border-strong)] bg-[var(--surface-strong)] shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:rounded-2xl"
    >
      <Command.Input
        placeholder={placeholder}
        className="w-full border-b border-[var(--surface-border)] bg-transparent px-4 py-4 text-base text-white outline-none placeholder:text-white/36 sm:text-sm"
      />
      <Command.List className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-white/44">
          {emptyLabel}
        </Command.Empty>
        <PaletteGroup
          heading={groupLabels.pages}
          items={items.filter((item) => item.group === 'pages')}
          onRun={run}
        />
        <PaletteGroup
          heading={groupLabels.actions}
          items={items.filter((item) => item.group === 'actions')}
          onRun={run}
        />
      </Command.List>
      <div
        aria-hidden="true"
        className="border-t border-[var(--surface-border)] px-4 py-2.5 text-center text-[0.68rem] font-medium tracking-[0.14em] text-white/36"
      >
        ↑↓ · Enter · Esc
      </div>
    </Command.Dialog>
  )
}
