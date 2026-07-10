'use client'

import { StaggerItem, StaggerReveal } from '@/components/motion/stagger-reveal'
import { switchByMap, type SwitchMap } from '@/lib/route-pairs'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type SiteHeaderClientProps = {
  locale: Locale
  homeHref: string
  nav: { label: string; href: string }[]
  localeSwitchLabel: string
  ctaLabel: string
  ctaHref: string
  labels: {
    mainNav: string
    openMenu: string
    closeMenu: string
    openPalette: string
  }
  /** Pares de rutas es↔en computados server-side (los diccionarios no viajan al cliente). */
  switchMap: SwitchMap
  targetHome: string
}

const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number]

function Logo({ href, onNavigate }: { href: string; onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={(event) => {
        onNavigate?.()
        // Ya en la home: el logo vuelve al comienzo con scroll suave (navegar
        // a la misma ruta no mueve el viewport).
        if (pathname === href) {
          event.preventDefault()
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      }}
      aria-label="GalfreDev — inicio"
      className="rounded-full text-sm font-semibold tracking-[0.22em] text-white transition duration-300 hover:opacity-85"
    >
      GALFRE
      <span className="text-[var(--color-accent-strong)]">DEV</span>
    </Link>
  )
}

function openCommandPalette() {
  window.dispatchEvent(new CustomEvent('open-command-palette'))
}

export function SiteHeaderClient({
  locale,
  homeHref,
  nav,
  localeSwitchLabel,
  ctaLabel,
  ctaHref,
  labels,
  switchMap,
  targetHome,
}: SiteHeaderClientProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Guard del switch de idioma: cruzar root layouts (es↔en) es una recarga
  // completa sin feedback del router — sin esto, un doble tap toca el switch
  // ya invertido de la página nueva y rebota al idioma original (bug real).
  const [switching, setSwitching] = useState(false)
  // Cierra el sheet al navegar a otra ruta (patrón "adjust state during render").
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  const switchHref = switchByMap(switchMap, pathname, targetHome)
  const switchAria = locale === 'es' ? 'Switch to English' : 'Cambiar a español'
  const targetLang = locale === 'es' ? 'en' : 'es'

  useEffect(() => {
    const onScroll = () => {
      const next = window.scrollY > 24
      setScrolled((current) => (current === next ? current : next))
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return

    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const localeSwitch = (mobile = false) => (
    <a
      href={switchHref}
      lang={targetLang}
      hrefLang={targetLang}
      aria-label={switchAria}
      aria-disabled={switching || undefined}
      data-testid="locale-switch"
      onClick={(event) => {
        // Navegación dura deliberada: el cambio de idioma cruza root layouts
        // (recarga completa sí o sí). assign() da feedback de carga inmediato
        // del browser y el guard hace inerte cualquier segundo tap.
        event.preventDefault()
        if (switching) return
        setSwitching(true)
        setOpen(false)
        window.location.assign(switchHref)
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-[var(--surface-border)] bg-white/[0.035] font-semibold tracking-[0.14em] text-white/72 transition duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-[0.97]',
        mobile ? 'px-5 py-3 text-sm' : 'px-3.5 py-2 text-xs',
        switching && 'pointer-events-none animate-pulse opacity-60',
      )}
    >
      {localeSwitchLabel}
    </a>
  )

  const cta = (mobile = false) => (
    <Link
      href={ctaHref}
      prefetch={false}
      onClick={() => setOpen(false)}
      className={cn(
        'group relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[rgba(61,221,196,0.2)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] font-semibold text-slate-950 shadow-[0_10px_30px_rgba(31,127,115,0.16)] transition duration-300 hover:shadow-[0_14px_38px_rgba(31,127,115,0.24)] active:scale-[0.97]',
        mobile ? 'flex-1 px-5 py-3 text-sm' : 'px-5 py-2 text-sm',
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.18),transparent)] opacity-0 transition duration-500 group-hover:translate-x-3 group-hover:opacity-100"
      />
      <span className="relative z-10">{ctaLabel}</span>
    </Link>
  )

  return (
    <>
      <header
        className={cn(
          'fixed top-0 z-50 w-full border-b transition-all duration-500',
          open
            ? 'border-transparent bg-transparent'
            : scrolled
              ? 'border-[var(--surface-border)] bg-[rgba(6,10,18,0.74)] shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl'
              : 'border-transparent bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:h-[4.5rem] lg:px-8">
          <Logo href={homeHref} onNavigate={() => setOpen(false)} />

          <nav
            aria-label={labels.mainNav}
            className="hidden items-center gap-7 lg:flex"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="group relative rounded-sm py-2 text-sm font-medium tracking-[-0.01em] text-white/64 transition duration-300 hover:text-white"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,rgba(61,221,196,0),rgba(61,221,196,0.85),rgba(61,221,196,0))] opacity-0 transition-opacity duration-300 group-hover:opacity-90"
                />
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              data-testid="palette-trigger"
              onClick={openCommandPalette}
              aria-label={labels.openPalette}
              className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--surface-border)] bg-white/[0.035] px-3 text-white/64 transition duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white active:scale-[0.97]"
            >
              <Search size={15} aria-hidden="true" />
              <kbd className="hidden font-sans text-[0.68rem] font-medium tracking-[0.08em] text-white/44 md:inline">
                ⌘K
              </kbd>
            </button>

            <div className="hidden lg:block">{localeSwitch()}</div>
            <div className="hidden lg:block">{cta()}</div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-label={open ? labels.closeMenu : labels.openMenu}
              aria-expanded={open}
              aria-controls="mobile-navigation"
              className="inline-flex size-9 items-center justify-center rounded-full border border-[var(--surface-border)] bg-white/[0.035] text-white transition duration-300 hover:border-white/20 hover:bg-white/[0.07] active:scale-[0.94] lg:hidden"
            >
              {open ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }}
            className="fixed inset-0 z-40 overflow-y-auto bg-[var(--surface-strong)] backdrop-blur-2xl lg:hidden"
          >
            <nav
              aria-label={labels.mainNav}
              className="mx-auto flex min-h-full max-w-7xl flex-col justify-center px-6 pb-12 pt-24 sm:px-8"
            >
              <StaggerReveal stagger={0.06} className="flex flex-col gap-1">
                {nav.map((item, index) => (
                  <StaggerItem key={item.href}>
                    <Link
                      href={item.href}
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 rounded-xl px-2 py-3 transition duration-300 active:scale-[0.99]"
                    >
                      <span
                        aria-hidden="true"
                        className="text-xs font-medium tracking-[0.2em] text-[rgba(61,221,196,0.66)]"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="text-3xl font-semibold tracking-[-0.04em] text-white/86 transition duration-300 group-hover:text-white">
                        {item.label}
                      </span>
                    </Link>
                  </StaggerItem>
                ))}

                <StaggerItem className="mt-8 border-t border-[var(--surface-border)] pt-8">
                  <div className="flex items-center gap-3 px-2">
                    {cta(true)}
                    {localeSwitch(true)}
                  </div>
                  <Link
                    href="/login"
                    prefetch={false}
                    onClick={() => setOpen(false)}
                    className="mt-5 inline-flex items-center gap-2 px-2 text-sm text-white/45 transition duration-300 hover:text-white/75"
                  >
                    {locale === 'es' ? 'Acceso · Mi perfil' : 'Sign in · My profile'}
                    <span aria-hidden>→</span>
                  </Link>
                </StaggerItem>
              </StaggerReveal>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
