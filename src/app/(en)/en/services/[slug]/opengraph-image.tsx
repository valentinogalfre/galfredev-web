import { getDictionary, serviceByLocalizedSlug } from '@/lib/i18n'
import { OG_SIZE, ogCard } from '@/lib/og-card'

export const alt = 'GalfreDev'
export const size = OG_SIZE
export const contentType = 'image/png'

export function generateStaticParams() {
  return Object.values(getDictionary('en').services).map((service) => ({
    slug: service.slug,
  }))
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const service = serviceByLocalizedSlug('en', slug)

  return ogCard({
    title: service?.name ?? 'GalfreDev',
    subtitle: service?.hero.sub ?? 'Custom software, WhatsApp bots & applied AI.',
  })
}
