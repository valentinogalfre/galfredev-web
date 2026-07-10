import { AboutPage } from '@/components/pages/about-page'
import { getDictionary } from '@/lib/i18n'
import type { Metadata } from 'next'

const { seo } = getDictionary('es').about

export const metadata: Metadata = {
  // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
  // '%s | GalfreDev' del layout lo duplicaría.
  title: { absolute: seo.title },
  description: seo.description,
  alternates: { canonical: '/sobre-mi' },
}

export default function Page() {
  return <AboutPage locale="es" />
}
