import { ServicePage } from '@/components/pages/service-page'
import { breadcrumbSchema, JsonLd, serviceSchema } from '@/components/seo/json-ld'
import { env } from '@/lib/env'
import { getDictionary, serviceByLocalizedSlug } from '@/lib/i18n'
import { hreflangAlternates } from '@/lib/seo'
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

  // El slug en inglés es distinto (localizado): se cruza por id via dict en.
  const enSlug = getDictionary('en').services[service.id].slug

  return {
    // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
    // '%s | GalfreDev' del layout lo duplicaría.
    title: { absolute: service.seo.title },
    description: service.seo.description,
    alternates: {
      canonical: `/servicios/${slug}`,
      ...hreflangAlternates(`/servicios/${slug}`, `/services/${enSlug}`),
    },
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

  const url = `${env.siteUrl}/servicios/${service.slug}`

  return (
    <>
      <JsonLd data={serviceSchema(service, 'es', url)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: env.siteUrl },
          { name: service.name, url },
        ])}
      />
      <ServicePage locale="es" service={service} />
    </>
  )
}
