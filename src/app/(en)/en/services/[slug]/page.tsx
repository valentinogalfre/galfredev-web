import { ServicePage } from '@/components/pages/service-page'
import { breadcrumbSchema, JsonLd, serviceSchema } from '@/components/seo/json-ld'
import { env } from '@/lib/env'
import { getDictionary, serviceByLocalizedSlug } from '@/lib/i18n'
import { hreflangAlternates } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return Object.values(getDictionary('en').services).map((service) => ({
    slug: service.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const service = serviceByLocalizedSlug('en', slug)
  if (!service) return {}

  // El slug en español es distinto (localizado): se cruza por id via dict es.
  const esSlug = getDictionary('es').services[service.id].slug

  return {
    // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
    // '%s | GalfreDev' del layout lo duplicaría.
    title: { absolute: service.seo.title },
    description: service.seo.description,
    alternates: {
      canonical: `/en/services/${slug}`,
      ...hreflangAlternates(`/servicios/${esSlug}`, `/services/${slug}`),
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = serviceByLocalizedSlug('en', slug)
  if (!service) notFound()

  const url = `${env.siteUrl}/en/services/${service.slug}`

  return (
    <>
      <JsonLd data={serviceSchema(service, 'en', url)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: `${env.siteUrl}/en` },
          { name: service.name, url },
        ])}
      />
      <ServicePage locale="en" service={service} />
    </>
  )
}
