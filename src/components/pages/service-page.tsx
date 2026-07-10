import { MicroDemoSlot } from '@/components/demos/micro'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { Parallax } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { StaggerItem, StaggerReveal } from '@/components/motion/stagger-reveal'
import { ProjectFrame, PROJECT_FRAME_KINDS } from '@/components/ui/project-frame'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { cn } from '@/lib/utils'
import type { Locale, ServiceContent } from '@/types/content'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

/** Chrome de página no cubierto por el dict (los textos del servicio vienen de service.*). */
const LABELS = {
  es: {
    demoKicker: 'Micro-demo',
    benefitsKicker: 'Beneficios',
    benefitsTitle: 'Qué gana tu negocio',
    relatedKicker: 'Casos reales',
    relatedTitle: 'Esto ya está funcionando',
    caseLabel: 'Ver el caso',
    ctaTitle: '¿Lo querés en tu negocio?',
    ctaSub: 'Contame tu caso por WhatsApp. Respondo en el día.',
    ctaPrimary: 'Consultar por WhatsApp',
    ctaSecondary: 'Prefiero el formulario',
    captureAlt: (name: string) => `Captura de ${name}`,
  },
  en: {
    demoKicker: 'Micro-demo',
    benefitsKicker: 'Benefits',
    benefitsTitle: 'What your business gets',
    relatedKicker: 'Real cases',
    relatedTitle: 'Already running in production',
    caseLabel: 'View case',
    ctaTitle: 'Want this in your business?',
    ctaSub: 'Tell me about your case on WhatsApp. I reply the same day.',
    ctaPrimary: 'Chat on WhatsApp',
    ctaSecondary: 'I prefer the form',
    captureAlt: (name: string) => `${name} screenshot`,
  },
} as const

/**
 * Server component: página completa de un servicio (hero compacto sin teclado
 * 3D, micro-demo, beneficios, casos relacionados y CTA). Header/footer viven
 * acá: las rutas [slug] solo resuelven el servicio y componen.
 */
export function ServicePage({
  locale,
  service,
}: {
  locale: Locale
  service: ServiceContent
}) {
  const dict = getDictionary(locale)
  const labels = LABELS[locale]
  const projectsBase = locale === 'es' ? '/proyectos/' : '/projects/'
  const contactHref = `${localizedPath(locale, '/')}${locale === 'es' ? '#contacto' : '#contact'}`

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="contenido-principal" className="relative overflow-x-clip">
        {/* Hero compacto de página interior: tipografía grande, glow teal, sin 100svh */}
        <section className="relative flex min-h-[55svh] flex-col justify-center overflow-hidden px-4 pb-14 pt-32 sm:px-6 sm:pb-16 sm:pt-40 lg:px-8">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[540px] bg-[radial-gradient(ellipse_at_50%_-12%,rgba(31,127,115,0.24),transparent_58%),radial-gradient(ellipse_at_12%_16%,rgba(31,127,115,0.08),transparent_42%),radial-gradient(ellipse_at_88%_8%,rgba(255,180,106,0.05),transparent_36%)]" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <span className="hero-enter inline-flex items-center gap-2.5 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(31,127,115,0.1)] px-4 py-1.5 font-mono text-[9px] tracking-[0.12em] text-[#8ceada] sm:text-[11px] sm:tracking-[0.16em]">
              <span className="relative inline-flex size-1.5 shrink-0">
                <span className="absolute inline-flex size-full rounded-full bg-[#3dddc4] opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#3dddc4] shadow-[0_0_10px_#3dddc4]" />
              </span>
              {service.hero.eyebrow}
            </span>

            <h1
              style={{ animationDelay: '0.08s' }}
              className="hero-enter-h1 mt-6 text-balance text-[2.5rem] font-bold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.6rem]"
            >
              {service.hero.title}{' '}
              <em className="inline-block bg-[linear-gradient(95deg,#a5f0e0_5%,#3dddc4_45%,#2a9184_95%)] bg-clip-text pr-1.5 font-normal italic text-transparent [font-family:var(--font-instrument-serif),Georgia,serif]">
                {service.hero.italic}
              </em>
            </h1>

            <p
              style={{ animationDelay: '0.16s' }}
              className="hero-enter mt-5 max-w-2xl text-pretty text-[0.95rem] leading-[1.65] text-[var(--text-soft)] sm:text-[1.08rem] sm:leading-8"
            >
              {service.hero.sub}
            </p>
          </div>
        </section>

        {/* Micro-demo: heading chico + slot (Task 20 enchufa la demo real) */}
        <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <p className="section-kicker">{labels.demoKicker}</p>
              <h2 className="mt-5 text-balance text-2xl font-semibold leading-[1.05] tracking-[-0.05em] text-white sm:text-[2.15rem]">
                {service.demoTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-pretty text-base leading-7 text-[var(--text-faint)] sm:text-lg">
                {service.demoHint}
              </p>
            </Reveal>

            <Reveal delay={0.08} variant="surface" className="mt-8 sm:mt-10">
              <MicroDemoSlot id={service.id} locale={locale} />
            </Reveal>
          </div>
        </section>

        {/* Beneficios */}
        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <SectionHeading eyebrow={labels.benefitsKicker} title={labels.benefitsTitle} />
            </Reveal>

            <StaggerReveal className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5">
              {service.benefits.map((benefit, index) => (
                <StaggerItem key={benefit.title} className="h-full">
                  <article className="h-full rounded-[1.7rem] border border-[var(--surface-border)] bg-white/[0.02] p-6 transition duration-300 hover:border-[rgba(61,221,196,0.18)] hover:bg-white/[0.03] sm:p-7">
                    <span
                      aria-hidden
                      className="font-mono text-xs tracking-[0.3em] text-[#3dddc4]/75"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-4 text-lg font-medium leading-snug tracking-[-0.02em] text-white sm:text-xl">
                      {benefit.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-7 text-white/60">{benefit.detail}</p>
                  </article>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* Casos relacionados */}
        <section className="px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <SectionHeading eyebrow={labels.relatedKicker} title={labels.relatedTitle} />
            </Reveal>

            <StaggerReveal
              className={cn(
                'mt-10 grid gap-5 sm:mt-12',
                service.relatedProjects.length > 1 ? 'sm:grid-cols-2' : 'sm:max-w-xl',
              )}
            >
              {service.relatedProjects.map((projectId) => {
                const project = dict.projects[projectId]

                return (
                  <StaggerItem key={projectId} className="h-full">
                    <Link
                      href={localizedPath(locale, `${projectsBase}${project.slug}`)}
                      className="group block h-full"
                    >
                      <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#0b1422_0%,#070d17_100%)] transition duration-300 hover:border-[rgba(61,221,196,0.22)] hover:shadow-[var(--surface-shadow-strong)]">
                        <div className="flex items-center justify-center border-b border-[var(--surface-border)] bg-white/[0.015] p-5 sm:p-6">
                          <Parallax offset={8} className="w-full">
                            <ProjectFrame
                              project={{
                                id: project.id,
                                name: project.name,
                                image: project.image,
                              }}
                              kind={PROJECT_FRAME_KINDS[project.id]}
                              captureAlt={labels.captureAlt(project.name)}
                            />
                          </Parallax>
                        </div>

                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                          <h3 className="text-xl font-medium tracking-[-0.04em] text-white sm:text-[1.4rem]">
                            {project.name}
                          </h3>
                          <p className="mt-2 text-base italic leading-snug text-[#7fe8d6] [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-lg">
                            {project.tagline}
                          </p>
                          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#3dddc4]">
                            {labels.caseLabel}
                            <ArrowRight
                              size={15}
                              aria-hidden
                              className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
                            />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </StaggerItem>
                )
              })}
            </StaggerReveal>
          </div>
        </section>

        {/* CTA final: WhatsApp con mensaje prearmado + fallback al form de la home */}
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
                    href={buildWhatsAppUrl(service.whatsappMessage)}
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
