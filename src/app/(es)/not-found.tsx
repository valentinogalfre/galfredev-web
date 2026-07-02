import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404',
  robots: {
    index: false,
    follow: false,
  },
}

export default function NotFound() {
  return (
    <main id="contenido-principal" className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32">
      <div className="absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(31,127,115,0.16),transparent_38%),radial-gradient(circle_at_76%_12%,rgba(255,180,106,0.08),transparent_24%)]" />
      <div className="page-panel relative mx-auto max-w-3xl p-8 text-center sm:p-12">
        <p className="section-kicker justify-center">Error 404</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-[3.4rem]">
          Esta página no existe.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--text-faint)]">
          Volvé al inicio para seguir viendo cómo GalfreDev puede ayudarte con automatización,
          software e IA aplicada.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.16)]"
          >
            Volver al inicio
          </Link>
          <Link
            href="/#contacto"
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-5 py-3 text-sm text-white/82 transition hover:border-white/24 hover:text-white"
          >
            Ir al contacto
          </Link>
        </div>
      </div>
    </main>
  )
}
