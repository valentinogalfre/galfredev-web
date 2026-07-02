import Link from 'next/link'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { getDictionary, localizedPath } from '@/lib/i18n'

// Stub honesto: home mínimo en inglés hasta que las tareas de Fase 3/4
// traigan el home completo compartido entre locales.
export default function EnglishHomePage() {
  const { hero } = getDictionary('en').home

  const resolveHref = (href: string) =>
    href.startsWith('#') ? href : localizedPath('en', href)

  return (
    <>
      <SiteHeader locale="en" />
      <main
        id="contenido-principal"
        className="relative flex min-h-screen flex-col items-center justify-center px-4 py-24 text-center sm:px-6"
      >
        <p className="section-kicker justify-center">{hero.eyebrow}</p>
        <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.06em] text-white sm:text-6xl">
          {hero.titlePrefix} <span className="italic">{hero.rotatingWords[0]}</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-[var(--text-faint)]">
          {hero.sub}
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={resolveHref(hero.ctaPrimary.href)}
            className="inline-flex items-center justify-center rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.16)]"
          >
            {hero.ctaPrimary.label}
          </Link>
          <Link
            href={resolveHref(hero.ctaSecondary.href)}
            className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-5 py-3 text-sm text-white/82 transition hover:border-white/24 hover:text-white"
          >
            {hero.ctaSecondary.label}
          </Link>
        </div>
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
