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
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="section-kicker mb-6">Error inesperado</p>
      <h1 className="text-3xl font-medium tracking-[-0.05em] text-white">
        Algo salió mal
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-7 text-white/55">
        Ocurrió un error al cargar esta página. Podés intentar de nuevo o contactarnos directamente.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-[var(--color-accent)]/24 bg-[var(--color-accent)]/10 px-5 py-2.5 text-sm font-medium text-[var(--color-accent)] transition hover:bg-[var(--color-accent)]/18"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/72 transition hover:bg-white/[0.07]"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
