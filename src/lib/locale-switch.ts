import { getDictionary, localizedPath, serviceByLocalizedSlug, projectByLocalizedSlug } from '@/lib/i18n'
import type { Locale } from '@/types/content'

/** Dada la ruta actual, devuelve la equivalente en el otro idioma (fallback: home). */
export function switchLocalePath(current: Locale, pathname: string): string {
  const target: Locale = current === 'es' ? 'en' : 'es'
  const clean = current === 'en' ? pathname.replace(/^\/en/, '') || '/' : pathname
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
