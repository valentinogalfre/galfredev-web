import { Parallax } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { siteCopy } from '@/content/site-content'
import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale } from '@/types/content'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

/**
 * Server component: teaser hacia /sobre-mi — /about. Reemplaza a las viejas
 * FounderSection + ProfileTeaserSection con una sola pieza: foto del founder
 * con marco teal y parallax sutil + título/teaser del diccionario + CTA pill.
 * Sin id: no está en el nav (el nav apunta a la página Sobre mí).
 */
export function AboutTeaserSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const { about } = dict.home
  const aboutPagePath = locale === 'es' ? '/sobre-mi' : '/about'
  const kicker =
    dict.common.nav.find((item) => item.href === aboutPagePath)?.label ?? about.title

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-8 sm:gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <Reveal variant="surface" className="order-last lg:order-first">
          <Parallax offset={26} className="mx-auto w-full max-w-[260px] sm:max-w-[380px] lg:max-w-[420px]">
            {/* Glow ambiental detrás de la foto */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(55%_55%_at_50%_45%,rgba(61,221,196,0.16),transparent_72%)] blur-2xl"
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-[rgba(61,221,196,0.22)] bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))] shadow-[0_24px_80px_rgba(0,0,0,0.45),0_0_48px_rgba(61,221,196,0.1)]">
              <Image
                src={siteCopy.founderImage}
                alt={siteCopy.founderName}
                width={460}
                height={460}
                sizes="(max-width: 1024px) 80vw, 420px"
                className="w-full object-cover"
              />
              {/* Borde interior sutil */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/8"
              />
              {/* Placa con el nombre */}
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-[rgba(7,14,24,0.78)] px-4 py-3 backdrop-blur-xl">
                <p className="text-sm font-medium tracking-[-0.02em] text-white">
                  {siteCopy.founderName}
                </p>
                <span
                  aria-hidden
                  className="inline-flex h-2 w-2 rounded-full bg-[#3dddc4] shadow-[0_0_12px_rgba(61,221,196,0.9)]"
                />
              </div>
            </div>
          </Parallax>
        </Reveal>

        <Reveal variant="section">
          <SectionHeading eyebrow={kicker} title={about.title} description={about.teaser} />

          <Link
            href={localizedPath(locale, about.cta.href)}
            className="group mt-6 inline-flex items-center gap-2 rounded-full sm:mt-8 border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.18)] transition duration-300 hover:translate-y-[-1px] hover:shadow-[0_18px_48px_rgba(31,127,115,0.24)]"
          >
            {about.cta.label}
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </Link>
        </Reveal>
      </div>
    </section>
  )
}
