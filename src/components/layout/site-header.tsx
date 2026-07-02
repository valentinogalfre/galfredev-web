import { SiteHeaderClient } from '@/components/layout/site-header-client'
import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale } from '@/types/content'

/** Hrefs del dict: '/#seccion' apunta al home del locale + hash; '/ruta' se prefija por locale. */
function resolveNavHref(locale: Locale, href: string): string {
  if (href.startsWith('/#')) {
    const home = localizedPath(locale, '/')
    return home === '/' ? href : `${home}${href.slice(1)}`
  }
  return localizedPath(locale, href)
}

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)

  const nav = dict.common.nav.map((item) => ({
    label: item.label,
    href: resolveNavHref(locale, item.href),
  }))

  const labels =
    locale === 'es'
      ? {
          mainNav: 'Navegación principal',
          openMenu: 'Abrir navegación',
          closeMenu: 'Cerrar navegación',
          openPalette: 'Abrir buscador rápido',
        }
      : {
          mainNav: 'Main navigation',
          openMenu: 'Open navigation',
          closeMenu: 'Close navigation',
          openPalette: 'Open quick search',
        }

  return (
    <SiteHeaderClient
      locale={locale}
      homeHref={localizedPath(locale, '/')}
      nav={nav}
      localeSwitchLabel={dict.common.localeSwitch}
      ctaLabel={dict.common.ctaTalk}
      ctaHref={resolveNavHref(locale, locale === 'es' ? '/#contacto' : '/#contact')}
      labels={labels}
    />
  )
}
