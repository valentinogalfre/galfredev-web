'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main
      id="contenido-principal"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-24 sm:px-6"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(31,127,115,0.16),transparent_38%),radial-gradient(circle_at_76%_12%,rgba(255,180,106,0.08),transparent_24%)]" />
      <div className="page-panel relative w-full max-w-xl p-8 text-center sm:p-12">
        <p className="section-kicker justify-center">Error inesperado</p>
        <h1 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl">
          Algo salió mal
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[var(--text-faint)]">
          Ocurrió un error al cargar esta página. Podés intentar de nuevo o contactarnos directamente.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.16)] transition duration-300 hover:-translate-y-px hover:shadow-[0_18px_48px_rgba(31,127,115,0.24)]"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-5 py-3 text-sm text-white/82 transition duration-300 hover:border-white/24 hover:text-white"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
