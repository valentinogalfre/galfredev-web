import { ProjectsIndexPage } from '@/components/pages/projects-index-page'
import { breadcrumbSchema, JsonLd } from '@/components/seo/json-ld'
import { env } from '@/lib/env'
import { hreflangAlternates } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // El template '%s | GalfreDev' del layout completa el título.
  title: 'Proyectos',
  description:
    'Casos reales en producción: bots de WhatsApp, apps, webs y software a medida construidos por GalfreDev, usados todos los días.',
  alternates: {
    canonical: '/proyectos',
    ...hreflangAlternates('/proyectos', '/projects'),
  },
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: env.siteUrl },
          { name: 'Proyectos', url: `${env.siteUrl}/proyectos` },
        ])}
      />
      <ProjectsIndexPage locale="es" />
    </>
  )
}
