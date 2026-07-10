import { BorderGlowCard } from '@/components/motion/border-glow-card'
import { Reveal } from '@/components/motion/reveal'
import { StaggerItem, StaggerReveal } from '@/components/motion/stagger-reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { Locale, ServiceContent, ServiceId } from '@/types/content'
import {
  ArrowUpRight,
  Blocks,
  Globe,
  MessageCircle,
  Smartphone,
  Workflow,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'

const SERVICE_ICONS: Record<ServiceId, LucideIcon> = {
  'bots-whatsapp': MessageCircle,
  webs: Globe,
  apps: Smartphone,
  'automatizaciones-ia': Workflow,
  'software-a-medida': Blocks,
}

/** Servicios estrella: cards grandes arriba en la grilla desktop. */
const FEATURED: ServiceId[] = ['bots-whatsapp', 'software-a-medida']

/** Orden de render: las estrella primero (fila superior / primeras del carrusel). */
const ORDER: ServiceId[] = [
  'bots-whatsapp',
  'software-a-medida',
  'webs',
  'apps',
  'automatizaciones-ia',
]

function ServiceCard({
  service,
  href,
  featured,
}: {
  service: ServiceContent
  href: string
  featured: boolean
}) {
  const Icon = SERVICE_ICONS[service.id]

  return (
    <Link
      href={href}
      className="group block h-full rounded-[2rem]"
      aria-label={service.name}
    >
      <BorderGlowCard className={cn('h-full', featured ? 'p-6 sm:p-8' : 'p-6 sm:p-7')}>
        <div className="flex h-full flex-col">
          <div className="flex items-start justify-between gap-4">
            <span
              aria-hidden
              className="inline-flex h-12 w-12 items-center justify-center rounded-[1.1rem] border border-[rgba(61,221,196,0.2)] bg-[rgba(61,221,196,0.08)] text-[#3dddc4] shadow-[0_0_28px_rgba(61,221,196,0.1)]"
            >
              <Icon size={22} strokeWidth={1.8} />
            </span>
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/40 transition duration-300 group-hover:border-[rgba(61,221,196,0.4)] group-hover:text-[#3dddc4] motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
            >
              <ArrowUpRight size={16} />
            </span>
          </div>

          <h3
            className={cn(
              'mt-6 font-medium tracking-[-0.045em] text-white',
              featured
                ? 'text-[1.55rem] leading-[1.06] sm:text-[1.9rem]'
                : 'text-[1.3rem] leading-[1.1] sm:text-[1.45rem]',
            )}
          >
            {service.name}
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-7 text-white/58">
            {service.hero.sub}
          </p>

          {featured ? (
            <ul className="mt-auto hidden space-y-2.5 pt-7 lg:block">
              {service.benefits.slice(0, 3).map((benefit) => (
                <li
                  key={benefit.title}
                  className="flex items-center gap-3 text-sm text-white/72"
                >
                  <span
                    aria-hidden
                    className="h-1 w-4 shrink-0 rounded-full bg-gradient-to-r from-[#3dddc4]/70 to-transparent"
                  />
                  {benefit.title}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </BorderGlowCard>
    </Link>
  )
}

/** Server component: grilla asimétrica de servicios (carrusel snap en mobile). */
export function ServicesSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const sectionId = locale === 'es' ? 'servicios' : 'services'
  const basePath = locale === 'es' ? '/servicios/' : '/services/'
  const kicker =
    dict.common.nav.find((item) => item.href === `/#${sectionId}`)?.label ??
    dict.home.services.title

  return (
    <section id={sectionId} className="px-4 py-14 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal variant="section">
          <SectionHeading
            eyebrow={kicker}
            title={dict.home.services.title}
            description={dict.home.services.sub}
          />
        </Reveal>

        <StaggerReveal
          delay={0.1}
          stagger={0.09}
          className="-mx-4 mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:mt-12 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-6 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {ORDER.map((id) => {
            const service = dict.services[id]
            const featured = FEATURED.includes(id)

            return (
              <StaggerItem
                key={id}
                className={cn(
                  'w-[78vw] max-w-[420px] shrink-0 snap-start lg:w-auto lg:max-w-none',
                  featured ? 'lg:col-span-3' : 'lg:col-span-2',
                )}
              >
                <ServiceCard
                  service={service}
                  href={localizedPath(locale, `${basePath}${service.slug}`)}
                  featured={featured}
                />
              </StaggerItem>
            )
          })}
        </StaggerReveal>
      </div>
    </section>
  )
}
