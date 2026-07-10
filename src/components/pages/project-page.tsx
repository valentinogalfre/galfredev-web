import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { Parallax } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { StaggerItem, StaggerReveal } from '@/components/motion/stagger-reveal'
import { ProjectFrame, PROJECT_FRAME_KINDS } from '@/components/ui/project-frame'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Locale, ProjectContent } from '@/types/content'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

/** Chrome de página no cubierto por el dict (los textos del caso vienen de project.*). */
const LABELS = {
  es: {
    problemKicker: 'El problema',
    solutionKicker: 'La solución',
    resultsKicker: 'Resultados',
    resultsTitle: 'Lo que quedó funcionando',
    stackKicker: 'Stack',
    stackTitle: 'Con qué está construido',
    relatedKicker: 'Servicios',
    relatedTitle: 'Los servicios detrás de este caso',
    serviceLabel: 'Ver el servicio',
    ctaTitle: '¿Querés algo así para tu negocio?',
    ctaSub: 'Contame tu caso por WhatsApp. Respondo en el día.',
    ctaPrimary: 'Consultar por WhatsApp',
    ctaSecondary: 'Prefiero el formulario',
    whatsappMessage: (name: string) =>
      `Hola, vi el caso ${name} y quiero algo así para mi negocio.`,
    captureAlt: (name: string) => `Captura de ${name}`,
  },
  en: {
    problemKicker: 'The problem',
    solutionKicker: 'The solution',
    resultsKicker: 'Results',
    resultsTitle: 'What ended up running',
    stackKicker: 'Stack',
    stackTitle: 'What it is built with',
    relatedKicker: 'Services',
    relatedTitle: 'The services behind this case',
    serviceLabel: 'View service',
    ctaTitle: 'Want something like this for your business?',
    ctaSub: 'Tell me about your case on WhatsApp. I reply the same day.',
    ctaPrimary: 'Chat on WhatsApp',
    ctaSecondary: 'I prefer the form',
    whatsappMessage: (name: string) =>
      `Hi, I saw the ${name} case and I want something like this for my business.`,
    captureAlt: (name: string) => `${name} screenshot`,
  },
} as const

/**
 * Server component: narrativa completa de un caso (hero con frame grande,
 * problema → solución, resultados, stack, servicios relacionados y CTA).
 * Header/footer viven acá: las rutas [slug] solo resuelven el proyecto.
 */
export function ProjectPage({
  locale,
  project,
}: {
  locale: Locale
  project: ProjectContent
}) {
  const dict = getDictionary(locale)
  const labels = LABELS[locale]
  const servicesBase = locale === 'es' ? '/servicios/' : '/services/'
  const contactHref = `${localizedPath(locale, '/')}${locale === 'es' ? '#contacto' : '#contact'}`
  const serviceNames = project.services.map((id) => dict.services[id].name)

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="contenido-principal" className="relative overflow-x-clip">
        {/* Hero: eyebrow con los servicios del caso + name + tagline + frame grande */}
        <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40 lg:px-8">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_50%_-12%,rgba(31,127,115,0.24),transparent_58%),radial-gradient(ellipse_at_12%_16%,rgba(31,127,115,0.08),transparent_42%),radial-gradient(ellipse_at_88%_8%,rgba(255,180,106,0.05),transparent_36%)]" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <span className="hero-enter inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(31,127,115,0.1)] px-4 py-1.5 font-mono text-[9px] tracking-[0.12em] text-[#8ceada] sm:text-[11px] sm:tracking-[0.16em]">
              {serviceNames.map((name, index) => (
                <span key={name} className="inline-flex items-center gap-2.5">
                  {index > 0 ? (
                    <span aria-hidden className="text-[#3dddc4]/50">
                      ·
                    </span>
                  ) : null}
                  {name}
                </span>
              ))}
            </span>

            <h1
              style={{ animationDelay: '0.08s' }}
              className="hero-enter-h1 mt-6 text-balance text-[2.5rem] font-bold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.6rem]"
            >
              {project.name}
            </h1>

            <p
              style={{ animationDelay: '0.16s' }}
              className="hero-enter mt-5 max-w-2xl text-pretty text-xl italic leading-snug text-[#7fe8d6] [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-2xl"
            >
              {project.tagline}
            </p>
          </div>

          <div className="relative z-10 mx-auto mt-12 w-full max-w-3xl sm:mt-16">
            <Parallax offset={22}>
              <ProjectFrame
                project={{ id: project.id, name: project.name, image: project.image }}
                kind={PROJECT_FRAME_KINDS[project.id]}
                captureAlt={labels.captureAlt(project.name)}
              />
            </Parallax>
          </div>
        </section>

        {/* Problema → Solución */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:gap-10">
            <Reveal variant="section">
              <p className="section-kicker">{labels.problemKicker}</p>
              <p className="mt-6 text-pretty text-lg leading-[1.7] text-white/78 sm:text-xl sm:leading-[1.75]">
                {project.problem}
              </p>
            </Reveal>

            <Reveal variant="section" delay={0.1}>
              <p className="section-kicker">{labels.solutionKicker}</p>
              <p className="mt-6 text-pretty text-lg leading-[1.7] text-white/78 sm:text-xl sm:leading-[1.75]">
                {project.solution}
              </p>
            </Reveal>
          </div>
        </section>

        {/* Resultados */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <SectionHeading eyebrow={labels.resultsKicker} title={labels.resultsTitle} />
            </Reveal>

            <StaggerReveal className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-3 sm:gap-5">
              {project.results.map((result) => (
                <StaggerItem key={result} className="h-full">
                  <article className="h-full rounded-[1.7rem] border border-[var(--surface-border)] bg-white/[0.02] p-6 transition duration-300 hover:border-[rgba(61,221,196,0.18)] hover:bg-white/[0.03]">
                    <span
                      aria-hidden
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(61,221,196,0.25)] bg-[rgba(31,127,115,0.12)]"
                    >
                      <Check size={16} strokeWidth={2.6} className="text-[#3dddc4]" />
                    </span>
                    <p className="mt-4 text-base font-medium leading-7 text-white/85">{result}</p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* Stack completo */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <p className="section-kicker">{labels.stackKicker}</p>
              <h2 className="mt-5 text-balance text-2xl font-semibold leading-[1.05] tracking-[-0.05em] text-white sm:text-[2.15rem]">
                {labels.stackTitle}
              </h2>

              <div className="mt-8 flex flex-wrap gap-2.5">
                {project.stack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-[13px] font-medium text-white/70"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Servicios relacionados (inverso a los casos de service-page) */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <SectionHeading eyebrow={labels.relatedKicker} title={labels.relatedTitle} />
            </Reveal>

            <StaggerReveal className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {project.services.map((serviceId) => {
                const service = dict.services[serviceId]

                return (
                  <StaggerItem key={serviceId} className="h-full">
                    <Link
                      href={localizedPath(locale, `${servicesBase}${service.slug}`)}
                      className="group flex h-full flex-col rounded-[1.7rem] border border-[var(--surface-border)] bg-white/[0.02] p-6 transition duration-300 hover:border-[rgba(61,221,196,0.22)] hover:bg-white/[0.035]"
                    >
                      <h3 className="text-lg font-medium leading-snug tracking-[-0.02em] text-white">
                        {service.name}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
                        {service.hero.sub}
                      </p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#3dddc4]">
                        {labels.serviceLabel}
                        <ArrowRight
                          size={15}
                          aria-hidden
                          className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                        />
                      </span>
                    </Link>
                  </StaggerItem>
                )
              })}
            </StaggerReveal>
          </div>
        </section>

        {/* CTA final: WhatsApp que nombra el proyecto + fallback al form */}
        <section className="px-4 pb-24 pt-4 sm:px-6 sm:pb-28 lg:px-8">
          <Reveal variant="surface" className="mx-auto max-w-5xl">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-[rgba(61,221,196,0.2)] bg-[linear-gradient(165deg,rgba(31,127,115,0.16),rgba(8,12,20,0.92)_62%)] px-6 py-14 text-center shadow-[var(--surface-shadow)] sm:px-12 sm:py-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-30%,rgba(61,221,196,0.16),transparent_58%)]"
              />

              <div className="relative">
                <h2 className="text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.06em] text-white sm:text-[2.7rem]">
                  {labels.ctaTitle}
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-pretty text-base leading-7 text-[var(--text-soft)] sm:text-lg">
                  {labels.ctaSub}
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <a
                    href={buildWhatsAppUrl(labels.whatsappMessage(project.name))}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-full border border-[rgba(61,221,196,0.22)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-7 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_44px_rgba(31,127,115,0.34)] transition duration-300 hover:-translate-y-px hover:shadow-[0_18px_52px_rgba(31,127,115,0.44)] active:scale-[0.985] sm:w-auto"
                  >
                    {labels.ctaPrimary}
                    <ArrowRight
                      size={16}
                      aria-hidden
                      className="transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                    />
                  </a>
                  <Link
                    href={contactHref}
                    className="inline-flex min-h-12 w-full max-w-xs items-center justify-center rounded-full border border-white/12 bg-white/[0.035] px-7 py-3 text-sm text-white/84 transition duration-300 hover:border-white/24 hover:bg-white/[0.055] hover:text-white active:scale-[0.985] sm:w-auto"
                  >
                    {labels.ctaSecondary}
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
