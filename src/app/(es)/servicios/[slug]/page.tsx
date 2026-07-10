import { ServicePage } from '@/components/pages/service-page'
import { getDictionary, serviceByLocalizedSlug } from '@/lib/i18n'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return Object.values(getDictionary('es').services).map((service) => ({
    slug: service.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = serviceByLocalizedSlug('es', slug)
  if (!service) return {}

  return {
    // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
    // '%s | GalfreDev' del layout lo duplicaría.
    title: { absolute: service.seo.title },
    description: service.seo.description,
    alternates: { canonical: `/servicios/${slug}` },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = serviceByLocalizedSlug('es', slug)
  if (!service) notFound()

  return <ServicePage locale="es" service={service} />
}
