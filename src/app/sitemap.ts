import { env } from '@/lib/env'
import { getDictionary } from '@/lib/i18n'
import type { MetadataRoute } from 'next'

const es = getDictionary('es')
const en = getDictionary('en')

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency']

const lastModified = new Date()

function absolute(path: string) {
  return path === '/' ? env.siteUrl : `${env.siteUrl}${path}`
}

/** Página espejada es↔en: genera ambas entradas, cada una con sus hreflang
 *  (mismo criterio que hreflangAlternates en lib/seo.ts, pero con URLs
 *  absolutas como exige el protocolo de sitemaps). */
function mirrored(
  esPath: string,
  enPath: string,
  priority: number,
  changeFrequency: ChangeFrequency,
): MetadataRoute.Sitemap {
  const esUrl = absolute(esPath)
  const enUrl = absolute(enPath === '/' ? '/en' : `/en${enPath}`)
  const alternates = {
    languages: { 'es-AR': esUrl, en: enUrl, 'x-default': esUrl },
  }
  return [
    { url: esUrl, lastModified, changeFrequency, priority, alternates },
    { url: enUrl, lastModified, changeFrequency, priority, alternates },
  ]
}

/** Páginas solo-es (legales). Login/perfil/dashboard quedan fuera a propósito:
 *  son privadas/noindex y no aportan al crawl. */
function esOnly(
  path: string,
  priority: number,
  changeFrequency: ChangeFrequency,
): MetadataRoute.Sitemap {
  return [{ url: absolute(path), lastModified, changeFrequency, priority }]
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...mirrored('/', '/', 1, 'weekly'),
    // Los slugs de servicios están localizados: se cruzan por id.
    ...Object.values(es.services).flatMap((service) =>
      mirrored(
        `/servicios/${service.slug}`,
        `/services/${en.services[service.id].slug}`,
        0.9,
        'monthly',
      ),
    ),
    ...mirrored('/proyectos', '/projects', 0.8, 'weekly'),
    // Los proyectos comparten slug en ambos idiomas.
    ...Object.values(es.projects).flatMap((project) =>
      mirrored(`/proyectos/${project.slug}`, `/projects/${project.slug}`, 0.8, 'monthly'),
    ),
    ...mirrored('/sobre-mi', '/about', 0.7, 'monthly'),
    ...esOnly('/privacidad', 0.3, 'yearly'),
    ...esOnly('/terminos', 0.3, 'yearly'),
  ]
}
