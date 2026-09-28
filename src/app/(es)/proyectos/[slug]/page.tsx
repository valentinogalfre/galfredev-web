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
  return Object.values(getDictionary('es').projects).map((project) => ({
    slug: project.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = projectByLocalizedSlug('es', slug)
  if (!project) return {}

  return {
    // absolute: el seo.title del dict ya trae "| GalfreDev" — el template
    // '%s | GalfreDev' del layout lo duplicaría.
    title: { absolute: project.seo.title },
    description: project.seo.description,
    alternates: {
      canonical: `/proyectos/${slug}`,
      // Los proyectos comparten slug en ambos idiomas.
      ...hreflangAlternates(`/proyectos/${slug}`, `/projects/${slug}`),
    },
    ...socialMetadata({
      title: project.seo.title,
      description: project.seo.description,
      path: `/proyectos/${slug}`,
      locale: 'es',
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
  const project = projectByLocalizedSlug('es', slug)
  if (!project) notFound()

  const url = `${env.siteUrl}/proyectos/${project.slug}`

  return (
    <>
      <JsonLd data={projectSchema(project, 'es', url)} />
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Inicio', url: env.siteUrl },
          { name: 'Proyectos', url: `${env.siteUrl}/proyectos` },
          { name: project.name, url },
        ])}
      />
      <ProjectPage locale="es" project={project} />
    </>
  )
}
