'use client'

import type { Locale } from '@/types/content'
import dynamic from 'next/dynamic'

/** Servicios que ya tienen micro-demo live (Task 21 suma las otras dos). */
export type LiveDemoId = 'bots-whatsapp' | 'webs' | 'apps'

/**
 * Skeleton del slot mientras baja el chunk de la demo (ssr: false). Sin texto
 * (no conoce el locale): misma silueta y pulso que la estética del slot.
 */
function DemoSkeleton() {
  return (
    <div
      aria-hidden
      className="flex min-h-[230px] flex-col items-center justify-center gap-4 px-6 py-14 sm:min-h-[280px]"
    >
      <span className="inline-flex h-8 w-40 animate-pulse rounded-full border border-[rgba(61,221,196,0.2)] bg-[rgba(31,127,115,0.1)]" />
      <span className="h-3 w-56 max-w-full animate-pulse rounded-full bg-white/[0.06]" />
      <span className="h-3 w-40 max-w-full animate-pulse rounded-full bg-white/[0.05]" />
    </div>
  )
}

// Cada demo viaja en su propio chunk y solo para su servicio: ninguna infla
// el first-load de las demás rutas.
const WhatsappSim = dynamic(
  () => import('./whatsapp-sim').then((mod) => mod.WhatsappSim),
  { ssr: false, loading: DemoSkeleton },
)
const WebBuilder = dynamic(
  () => import('./web-builder').then((mod) => mod.WebBuilder),
  { ssr: false, loading: DemoSkeleton },
)
const PhoneApp = dynamic(
  () => import('./phone-app').then((mod) => mod.PhoneApp),
  { ssr: false, loading: DemoSkeleton },
)

/** Switch client de las demos live, lazy por servicio. */
export function MicroDemoLoader({ id, locale }: { id: LiveDemoId; locale: Locale }) {
  switch (id) {
    case 'bots-whatsapp':
      return <WhatsappSim locale={locale} />
    case 'webs':
      return <WebBuilder locale={locale} />
    case 'apps':
      return <PhoneApp locale={locale} />
  }
}
