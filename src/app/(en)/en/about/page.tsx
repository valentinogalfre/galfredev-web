import { AboutPage } from '@/components/pages/about-page'
import { breadcrumbSchema, JsonLd } from '@/components/seo/json-ld'
import { env } from '@/lib/env'
import { getDictionary } from '@/lib/i18n'
import { hreflangAlternates } from '@/lib/seo'
import type { Metadata } from 'next'

const { seo } = getDictionary('en').about

export const metadata: Metadata = {
  // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
  // '%s | GalfreDev' del layout lo duplicaría.
  title: { absolute: seo.title },
  description: seo.description,
  alternates: {
    canonical: '/en/about',
    ...hreflangAlternates('/sobre-mi', '/about'),
  },
}

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: `${env.siteUrl}/en` },
          { name: 'About', url: `${env.siteUrl}/en/about` },
        ])}
      />
      <AboutPage locale="en" />
    </>
  )
}
