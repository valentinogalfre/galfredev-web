import { siteCopy, socialLinks } from '@/content/site-content'
import { env } from '@/lib/env'
import type { Locale, ProjectContent, ServiceContent } from '@/types/content'

/** @id compartidos: los schemas de página referencian estas entidades (que
 *  viven en el layout) sin re-declararlas — una sola Organization/Person por
 *  documento según el grafo de schema.org. */
export const ORG_ID = `${env.siteUrl}/#organization`
export const PERSON_ID = `${env.siteUrl}/#founder`

type JsonLdObject = Record<string, unknown>

export function JsonLd({ data }: { data: JsonLdObject }) {
  return (
    <script
      type="application/ld+json"
      // Contenido first-party (diccionarios del repo), pero escapamos "<"
      // para que un "</script>" en el copy jamás pueda cortar el tag.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

const AREA_SERVED = [
  { '@type': 'Country', name: 'Argentina' },
  { '@type': 'City', name: 'Córdoba' },
]

function inLanguage(locale: Locale) {
  return locale === 'es' ? 'es-AR' : 'en'
}

export function serviceSchema(svc: ServiceContent, locale: Locale, url: string): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: svc.name,
    serviceType: svc.name,
    description: svc.seo.description,
    url,
    inLanguage: inLanguage(locale),
    provider: { '@id': ORG_ID },
    areaServed: AREA_SERVED,
  }
}

export function projectSchema(prj: ProjectContent, locale: Locale, url: string): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: prj.name,
    description: `${prj.tagline} ${prj.problem}`,
    url,
    image: `${env.siteUrl}${prj.image}`,
    applicationCategory: 'BusinessApplication',
    operatingSystem: prj.id === 'pulso' ? 'iOS' : 'Web',
    inLanguage: inLanguage(locale),
    creator: { '@id': ORG_ID },
  }
}

export function personSchema(): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': PERSON_ID,
    name: siteCopy.founderName,
    jobTitle: 'Founder & Software Developer',
    url: env.siteUrl,
    image: `${env.siteUrl}${siteCopy.founderImage}`,
    email: siteCopy.email,
    worksFor: { '@id': ORG_ID },
    sameAs: socialLinks
      .filter((item) => !item.href.startsWith('mailto:'))
      .map((item) => item.href),
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
