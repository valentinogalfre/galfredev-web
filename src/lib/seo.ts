import type { Locale } from '@/types/content'
import type { Metadata } from 'next'

/** alternates.languages para una página con equivalente en ambos idiomas.
 *  esPath/enPath SIN prefijo de locale (el de en se prefija acá). */
export function hreflangAlternates(esPath: string, enPath: string) {
  return {
    languages: {
      'es-AR': esPath,
      en: enPath === '/' ? '/en' : `/en${enPath}`,
      'x-default': esPath,
    },
  }
}

const OG_DEFAULT_ALT: Record<Locale, string> = {
  es: 'GalfreDev — Software que no duerme. Bots de WhatsApp, webs, apps e IA.',
  en: 'GalfreDev — Software that never sleeps. WhatsApp bots, websites, apps & AI.',
}

type SocialInput = {
  /** Título completo, tal cual debe verse al compartir (sin template). */
  title: string
  description: string
  /** Ruta canónica con prefijo de locale (/en/…); metadataBase la absolutiza. */
  path: string
  locale: Locale
  /**
   * true en segmentos con opengraph-image propio (servicios, proyectos): ahí
   * NO se declara imagen, porque una `images` de config en la página le gana
   * a la file-based (verificado en el build) y todas volvían a la de la home.
   */
  segmentImage?: boolean
}

/**
 * openGraph + twitter por página. En Next el `openGraph`/`twitter` de un
 * segmento REEMPLAZA al del layout (no se fusiona): sin esto cada página
 * heredaba título, descripción y og:url de la home al compartirse.
 *
 * - Imagen: la OG de marca por defecto; los segmentos con opengraph-image
 *   propio pasan `segmentImage` y usan la suya.
 * - twitter va sin `images`: Next la completa desde la og:image resuelta, así
 *   cada página muestra la suya en vez de la fija de la home.
 */
export function socialMetadata({
  title,
  description,
  path,
  locale,
  segmentImage = false,
}: SocialInput): Pick<
  Metadata,
  'openGraph' | 'twitter'
> {
  return {
    openGraph: {
      title,
      description,
      url: path,
      siteName: 'GalfreDev',
      locale: locale === 'es' ? 'es_AR' : 'en_US',
      type: 'website',
      ...(segmentImage
        ? {}
        : { images: [{ url: '/og-home.jpg', width: 1200, height: 630, alt: OG_DEFAULT_ALT[locale] }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
