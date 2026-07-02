import type { Dictionary, Locale, ServiceContent, ProjectContent } from '@/types/content'
import { es } from '@/content/es'
import { en } from '@/content/en'

const dictionaries: Record<Locale, Dictionary> = { es, en }

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}

export function serviceByLocalizedSlug(locale: Locale, slug: string): ServiceContent | undefined {
  return Object.values(dictionaries[locale].services).find((s) => s.slug === slug)
}

export function projectByLocalizedSlug(locale: Locale, slug: string): ProjectContent | undefined {
  return Object.values(dictionaries[locale].projects).find((p) => p.slug === slug)
}

/** path SIN prefijo de locale → ruta final ("/en" solo para inglés). */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === 'es') return path
  return path === '/' ? '/en' : `/en${path}`
}
