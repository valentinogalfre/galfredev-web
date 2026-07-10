import { KeyboardCss } from '@/components/hero/keyboard-css'
import type { TypingState } from '@/components/hero/use-typing-loop'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '404',
  robots: {
    index: false,
    follow: false,
  },
}

/** Static state for the decorative keyboard: "404" already typed, no key pressed. */
const TYPING_404: TypingState = {
  word: '404',
  typed: '404',
  pressedKey: null,
  wordIndex: 0,
}

export default function NotFound() {
  const { notFound } = getDictionary('en').common

  return (
    <main
      id="contenido-principal"
      className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pt-32"
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_top,rgba(31,127,115,0.16),transparent_38%),radial-gradient(circle_at_76%_12%,rgba(255,180,106,0.08),transparent_24%)]" />
      <div className="page-panel relative mx-auto max-w-3xl p-8 text-center sm:p-12">
        <p className="section-kicker justify-center">Error 404</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-[3.4rem]">
          {notFound.title}
        </h1>

        <KeyboardCss typing={TYPING_404} className="kb-mini mt-2" />

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/en"
            className="inline-flex items-center justify-center rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.16)] transition duration-300 hover:-translate-y-px hover:shadow-[0_18px_48px_rgba(31,127,115,0.24)]"
          >
            {notFound.back}
          </Link>
        </div>
      </div>
    </main>
  )
}
