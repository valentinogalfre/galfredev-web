import { getDictionary, projectByLocalizedSlug } from '@/lib/i18n'
import { OG_SIZE, ogCard } from '@/lib/og-card'

export const alt = 'GalfreDev'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return Object.values(getDictionary('es').projects).map((project) => ({
    slug: project.slug,
  }))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = projectByLocalizedSlug('es', slug)

  return ogCard({
    title: project?.name ?? 'GalfreDev',
    subtitle: project?.tagline ?? 'Automatización, software a medida e IA aplicada.',
  })
}
