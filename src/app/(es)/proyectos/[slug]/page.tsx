import { ProjectPage } from '@/components/pages/project-page'
import { getDictionary, projectByLocalizedSlug } from '@/lib/i18n'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

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
    alternates: { canonical: `/proyectos/${slug}` },
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

  return <ProjectPage locale="es" project={project} />
}
