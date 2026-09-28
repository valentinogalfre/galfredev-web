import { ProjectPage } from '@/components/pages/project-page'
import { breadcrumbSchema, JsonLd, projectSchema } from '@/components/seo/json-ld'
import { env } from '@/lib/env'
import { getDictionary, projectByLocalizedSlug } from '@/lib/i18n'
import { hreflangAlternates, socialMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// Solo los slugs del diccionario: uno desconocido es 404 directo, sin
// renderizarse ni cachearse on-demand (antes cualquier slug generaba su OG).
export const dynamicParams = false

export function generateStaticParams() {
  return Object.values(getDictionary('en').projects).map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = projectByLocalizedSlug('en', slug)
  if (!project) return {}

  return {
    // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
    // '%s | GalfreDev' del layout lo duplicaría.
    title: { absolute: project.seo.title },
    description: project.seo.description,
    alternates: {
      canonical: `/en/projects/${slug}`,
      // Los proyectos comparten slug en ambos idiomas.
      ...hreflangAlternates(`/proyectos/${slug}`, `/projects/${slug}`),
    },
    ...socialMetadata({
      title: project.seo.title,
      description: project.seo.description,
      path: `/en/projects/${slug}`,
      locale: 'en',
      segmentImage: true,
    }),
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = projectByLocalizedSlug('en', slug)
  if (!project) notFound()

  const url = `${env.siteUrl}/en/projects/${project.slug}`

  return (
    <>
      <JsonLd data={projectSchema(project, 'en', url)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: `${env.siteUrl}/en` },
          { name: 'Projects', url: `${env.siteUrl}/en/projects` },
          { name: project.name, url },
        ])}
      />
      <ProjectPage locale="en" project={project} />
    </>
  )
}
