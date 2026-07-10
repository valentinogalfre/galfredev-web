import { getDictionary, projectByLocalizedSlug } from '@/lib/i18n'
import { OG_SIZE, ogCard } from '@/lib/og-card'

export const alt = 'GalfreDev'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return Object.values(getDictionary('en').projects).map((project) => ({
    slug: project.slug,
  }))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = projectByLocalizedSlug('en', slug)

  return ogCard({
    title: project?.name ?? 'GalfreDev',
    subtitle: project?.tagline ?? 'Custom software, WhatsApp bots & applied AI.',
  })
}
