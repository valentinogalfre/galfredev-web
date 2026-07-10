import { getDictionary, serviceByLocalizedSlug } from '@/lib/i18n'
import { OG_SIZE, ogCard } from '@/lib/og-card'

export const alt = 'GalfreDev'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return Object.values(getDictionary('es').services).map((service) => ({
    slug: service.slug,
  }))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = serviceByLocalizedSlug('es', slug)

  return ogCard({
    title: service?.name ?? 'GalfreDev',
    subtitle: service?.hero.sub ?? 'Automatización, software a medida e IA aplicada.',
  })
}
