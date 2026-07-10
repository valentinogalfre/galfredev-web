import { ProjectsIndexPage } from '@/components/pages/projects-index-page'
import { breadcrumbSchema, JsonLd } from '@/components/seo/json-ld'
import { env } from '@/lib/env'
import { hreflangAlternates } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // El template '%s | GalfreDev' del layout completa el título.
  title: 'Projects',
  description:
    'Real cases in production: WhatsApp bots, apps, websites and custom software built by GalfreDev, used every single day.',
  alternates: {
    canonical: '/en/projects',
    ...hreflangAlternates('/proyectos', '/projects'),
  },
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: `${env.siteUrl}/en` },
          { name: 'Projects', url: `${env.siteUrl}/en/projects` },
        ])}
      />
      <ProjectsIndexPage locale="en" />
    </>
  )
}
