import type { Locale } from '@/types/content'
import { CommandPaletteProvider } from '@/components/command/command-palette-provider'
import { WhatsAppFab } from '@/components/layout/whatsapp-fab'
import { CursorSpotlight } from '@/components/motion/cursor-spotlight'
import { LenisProvider } from '@/components/motion/lenis-provider'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

export function RootShell({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <body className="antialiased">
      <a
        href="#contenido-principal"
        className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-slate-950 focus:not-sr-only"
      >
        {locale === 'es' ? 'Saltar al contenido' : 'Skip to content'}
      </a>
      <CursorSpotlight />
      <LenisProvider>{children}</LenisProvider>
      <CommandPaletteProvider locale={locale} />
      <WhatsAppFab locale={locale} />
      <Analytics />
      <SpeedInsights />
    </body>
  )
}
