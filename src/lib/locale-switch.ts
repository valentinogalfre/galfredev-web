import { getDictionary, localizedPath, serviceByLocalizedSlug, projectByLocalizedSlug } from '@/lib/i18n'
import { LOCALES, type Locale } from '@/types/content'

/** Dada la ruta actual, devuelve la equivalente en el otro idioma (fallback: home). */
export function switchLocalePath(current: Locale, pathname: string): string {
  const target: Locale = current === 'es' ? 'en' : 'es'
  const clean = current === 'en' ? pathname.replace(/^\/en(?=\/|$)/, '') || '/' : pathname
  const tDict = getDictionary(target)
  const svcMatch = clean.match(/^\/(servicios|services)\/([^/]+)$/)
  if (svcMatch) {
    const svc = serviceByLocalizedSlug(current, svcMatch[2])
    if (svc) return localizedPath(target, `/${target === 'es' ? 'servicios' : 'services'}/${tDict.services[svc.id].slug}`)
  }
  const prjMatch = clean.match(/^\/(proyectos|projects)\/([^/]+)$/)
  if (prjMatch) {
    const prj = projectByLocalizedSlug(current, prjMatch[2])
    if (prj) return localizedPath(target, `/${target === 'es' ? 'proyectos' : 'projects'}/${tDict.projects[prj.id].slug}`)
  }
  const staticMap: Record<string, string> = current === 'es'
    ? { '/': '/', '/proyectos': '/projects', '/sobre-mi': '/about' }
    : { '/': '/', '/projects': '/proyectos', '/about': '/sobre-mi' }
  return localizedPath(target, staticMap[clean] ?? '/')
}

/**
 * Mapa plano bidireccional ruta→ruta equivalente en el otro idioma
 * (~24 entradas: home, estáticas y slugs de servicios/proyectos por locale).
 * SOLO server-side: usa los diccionarios. El cliente recibe el mapa como prop
 * y resuelve con switchByMap (lib/route-pairs.ts) sin cargar contenido.
 */
export function buildLocaleSwitchMap(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const locale of LOCALES) {
    const dict = getDictionary(locale)
    const servicesBase = locale === 'es' ? 'servicios' : 'services'
    const projectsBase = locale === 'es' ? 'proyectos' : 'projects'
    const paths = [
      '/',
      `/${projectsBase}`,
      locale === 'es' ? '/sobre-mi' : '/about',
      ...Object.values(dict.services).map((service) => `/${servicesBase}/${service.slug}`),
      ...Object.values(dict.projects).map((project) => `/${projectsBase}/${project.slug}`),
    ]
    for (const path of paths) {
      const from = localizedPath(locale, path)
      map[from] = switchLocalePath(locale, from)
    }
  }
  return map
}
