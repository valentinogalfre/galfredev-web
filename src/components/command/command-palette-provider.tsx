import type { PaletteItem } from '@/components/command/command-palette'
import { CommandPaletteLoader } from '@/components/command/command-palette-loader'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { buildLocaleSwitchMap } from '@/lib/locale-switch'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Locale } from '@/types/content'

/**
 * Server component: arma los items de la palette desde los diccionarios y le
 * pasa TODO como props planas al client, para que ningún contenido de
 * marketing viaje en el bundle cliente.
 */
export function CommandPaletteProvider({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const servicesBase = locale === 'es' ? 'servicios' : 'services'
  const projectsBase = locale === 'es' ? 'proyectos' : 'projects'

  const items: PaletteItem[] = [
    {
      group: 'pages',
      label: locale === 'es' ? 'Inicio' : 'Home',
      href: localizedPath(locale, '/'),
      keywords: locale === 'es' ? 'home' : 'inicio',
    },
    ...Object.values(dict.services).map(
      (service): PaletteItem => ({
        group: 'pages',
        label: service.name,
        href: localizedPath(locale, `/${servicesBase}/${service.slug}`),
        keywords: service.slug,
      }),
    ),
    {
      group: 'pages',
      label: locale === 'es' ? 'Proyectos' : 'Projects',
      href: localizedPath(locale, `/${projectsBase}`),
    },
    ...Object.values(dict.projects).map(
      (project): PaletteItem => ({
        group: 'pages',
        label: project.name,
        href: localizedPath(locale, `/${projectsBase}/${project.slug}`),
        keywords: project.slug,
      }),
    ),
    {
      group: 'pages',
      label: locale === 'es' ? 'Sobre mí' : 'About me',
      href: localizedPath(locale, locale === 'es' ? '/sobre-mi' : '/about'),
    },
    {
      group: 'actions',
      label: dict.common.ctaTalk,
      action: 'whatsapp',
      keywords: 'whatsapp',
    },
    {
      group: 'actions',
      label: locale === 'es' ? 'English' : 'Español',
      action: 'switch-locale',
      keywords: locale === 'es' ? 'idioma language' : 'spanish idioma language',
    },
  ]

  return (
    <CommandPaletteLoader
      locale={locale}
      placeholder={dict.common.commandPalette.placeholder}
      groupLabels={dict.common.commandPalette.groups}
      items={items}
      whatsappUrl={buildWhatsAppUrl(dict.common.whatsappBaseMessage)}
      switchMap={buildLocaleSwitchMap()}
      targetHome={localizedPath(locale === 'es' ? 'en' : 'es', '/')}
    />
  )
}
