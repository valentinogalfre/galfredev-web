import { Marquee } from '@/components/motion/marquee'
import { socialLinks } from '@/content/site-content'
import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale } from '@/types/content'
import Link from 'next/link'

/** Misma resolución que el header: '/#seccion' → home del locale + hash. */
function resolveNavHref(locale: Locale, href: string): string {
  if (href.startsWith('/#')) {
    const home = localizedPath(locale, '/')
    return home === '/' ? href : `${home}${href.slice(1)}`
  }
  return localizedPath(locale, href)
}

export function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const year = new Date().getFullYear()

  const columns =
    locale === 'es'
      ? { nav: 'Navegación', social: 'Redes y contacto', signIn: 'Acceso' }
      : { nav: 'Navigation', social: 'Social & contact', signIn: 'Sign in' }

  const legalLinks =
    locale === 'es'
      ? [
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos', href: '/terminos' },
        ]
      : [
          { label: 'Privacy', href: '/privacidad' },
          { label: 'Terms', href: '/terminos' },
        ]

  return (
    <footer className="relative border-t border-[var(--surface-border)] bg-black/40">
      <div aria-hidden="true" className="border-b border-[var(--surface-border)] py-8">
        <Marquee speed={38} className="select-none">
          {dict.home.hero.typedWords.map((word) => (
            <span
              key={word}
              className="flex shrink-0 items-baseline gap-8 pr-8 font-serif-display text-5xl tracking-[-0.02em] text-white/8 sm:text-7xl"
            >
              {word}
              <span className="text-3xl text-[rgba(61,221,196,0.35)] sm:text-4xl">✦</span>
            </span>
          ))}
        </Marquee>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.3fr_0.7fr_0.8fr] lg:px-8">
        <div className="space-y-4">
          <Link
            href={localizedPath(locale, '/')}
            prefetch={false}
            className="inline-block rounded-full text-sm font-semibold tracking-[0.22em] text-white transition hover:opacity-85"
          >
            GALFRE
            <span className="text-[var(--color-accent-strong)]">DEV</span>
          </Link>
          <p className="max-w-md text-sm leading-7 text-[var(--text-faint)]">
            {dict.home.hero.sub}
          </p>
        </div>

        <nav aria-label={columns.nav} className="space-y-4">
          <p className="text-sm font-medium text-white">{columns.nav}</p>
          <div className="grid gap-3 text-sm text-white/62">
            {dict.common.nav.map((item) => (
              <Link
                key={item.href}
                href={resolveNavHref(locale, item.href)}
                prefetch={false}
                className="w-fit rounded-sm transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <div className="space-y-4">
          <p className="text-sm font-medium text-white">{columns.social}</p>
          <div className="grid gap-3 text-sm text-white/62">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target={item.href.startsWith('mailto:') ? undefined : '_blank'}
                rel={item.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                className="w-fit rounded-sm transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--surface-border)] px-4 py-5 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-xs text-white/44 sm:flex-row">
          <p>
            © {year} GalfreDev. {dict.common.footer.rights} {dict.common.footer.madeIn}
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className="rounded-sm transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" prefetch={false} className="rounded-sm transition hover:text-white">
              {columns.signIn}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
