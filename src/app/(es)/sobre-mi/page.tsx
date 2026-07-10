import { AboutPage } from '@/components/pages/about-page'
import { breadcrumbSchema, JsonLd } from '@/components/seo/json-ld'
import { env } from '@/lib/env'
import { getDictionary } from '@/lib/i18n'
import { hreflangAlternates } from '@/lib/seo'
import type { Metadata } from 'next'

const { seo } = getDictionary('es').about

export const metadata: Metadata = {
  // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
  // '%s | GalfreDev' del layout lo duplicaría.
  title: { absolute: seo.title },
  description: seo.description,
  alternates: {
    canonical: '/sobre-mi',
    ...hreflangAlternates('/sobre-mi', '/about'),
  },
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: env.siteUrl },
          { name: 'Sobre mí', url: `${env.siteUrl}/sobre-mi` },
        ])}
      />
      <AboutPage locale="es" />
    </>
  )
}
