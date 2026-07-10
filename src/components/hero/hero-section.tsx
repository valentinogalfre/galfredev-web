import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale } from '@/types/content'
import { HeroClient } from './hero-client'

/** Anchors ('#contacto') quedan tal cual; rutas ('/proyectos') se prefijan por locale. */
function resolveHref(locale: Locale, href: string): string {
  return href.startsWith('#') ? href : localizedPath(locale, href)
}

/** Server component: lee el diccionario y baja props planas al cliente. */
export function HeroSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const { hero } = dict.home

  return (
    <HeroClient
      eyebrow={hero.eyebrow}
      titlePrefix={hero.titlePrefix}
      rotatingWords={hero.rotatingWords}
      sub={hero.sub}
      ctaPrimary={{ label: hero.ctaPrimary.label, href: resolveHref(locale, hero.ctaPrimary.href) }}
      ctaSecondary={{ label: hero.ctaSecondary.label, href: resolveHref(locale, hero.ctaSecondary.href) }}
      typedWords={hero.typedWords}
      soundOnLabel={hero.soundOn}
      soundOffLabel={hero.soundOff}
      eggMessage={hero.eggMessage}
      marqueeItems={Object.values(dict.projects).map((project) => ({
        name: project.name,
        tagline: project.tagline,
      }))}
    />
  )
}
