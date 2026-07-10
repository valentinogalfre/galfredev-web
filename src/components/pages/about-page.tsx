import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { Parallax } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { StaggerItem, StaggerReveal } from '@/components/motion/stagger-reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { siteCopy } from '@/content/site-content'
import { getDictionary, localizedPath } from '@/lib/i18n'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Locale } from '@/types/content'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

/** Chrome de página no cubierto por el dict (historia/stack/certs vienen de about.*). */
const LABELS = {
  es: {
    storyKicker: 'Mi historia',
    stackKicker: 'Stack',
    stackTitle: 'Con qué trabajo todos los días',
    certsKicker: 'Certificaciones',
    certsTitle: 'Formación que respalda el trabajo',
    certAlt: (title: string, issuer: string) => `Certificado ${title} de ${issuer}`,
    ctaTitle: '¿Trabajamos juntos?',
    ctaSub: 'Contame tu caso por WhatsApp. Respondo en el día.',
    ctaPrimary: 'Consultar por WhatsApp',
    ctaSecondary: 'Prefiero el formulario',
    whatsappMessage: 'Hola Valentino, leí tu historia en GalfreDev y quiero contarte mi caso.',
  },
  en: {
    storyKicker: 'My story',
    stackKicker: 'Stack',
    stackTitle: 'What I work with every day',
    certsKicker: 'Certifications',
    certsTitle: 'Training that backs the work',
    certAlt: (title: string, issuer: string) => `${title} certificate from ${issuer}`,
    ctaTitle: 'Shall we work together?',
    ctaSub: 'Tell me about your case on WhatsApp. I reply the same day.',
    ctaPrimary: 'Chat on WhatsApp',
    ctaSecondary: 'I prefer the form',
    whatsappMessage: "Hi Valentino, I read your story on GalfreDev and I'd like to tell you about my case.",
  },
} as const

/**
 * Server component: página Sobre mí (/sobre-mi — /en/about). Hero con la foto
 * del founder (mismo tratamiento teal que el teaser de la home) + título con
 * remate en serif itálica, historia en primera persona, stack agrupado,
 * certificaciones y CTA a WhatsApp/form. Header/footer viven acá.
 */
export function AboutPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const about = dict.about
  const labels = LABELS[locale]
  const aboutPagePath = locale === 'es' ? '/sobre-mi' : '/about'
  const kicker = dict.common.nav.find((item) => item.href === aboutPagePath)?.label ?? about.title
  const contactHref = `${localizedPath(locale, '/')}${locale === 'es' ? '#contacto' : '#contact'}`

  // 'Del código al negocio' / 'From code to business': la última palabra es el
  // remate natural del título — va en serif itálica teal, como en los heroes.
  const titleWords = about.title.split(' ')
  const titleAccent = titleWords.pop() ?? ''
  const titleLead = titleWords.join(' ')

  const [lede, ...storyRest] = about.story

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="contenido-principal" className="relative overflow-x-clip">
        {/* Hero: título + lede a la izquierda, foto grande con marco teal a la derecha */}
        <section className="relative overflow-hidden px-4 pb-16 pt-32 sm:px-6 sm:pb-20 sm:pt-40 lg:px-8">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(ellipse_at_50%_-12%,rgba(31,127,115,0.24),transparent_58%),radial-gradient(ellipse_at_12%_16%,rgba(31,127,115,0.08),transparent_42%),radial-gradient(ellipse_at_88%_8%,rgba(255,180,106,0.05),transparent_36%)]" />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <span className="hero-enter inline-flex items-center gap-2.5 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(31,127,115,0.1)] px-4 py-1.5 font-mono text-[9px] tracking-[0.12em] text-[#8ceada] sm:text-[11px] sm:tracking-[0.16em]">
                <span className="relative inline-flex size-1.5 shrink-0">
                  <span className="absolute inline-flex size-full rounded-full bg-[#3dddc4] opacity-60 motion-safe:animate-ping" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-[#3dddc4] shadow-[0_0_10px_#3dddc4]" />
                </span>
                {kicker}
              </span>

              <h1
                style={{ animationDelay: '0.08s' }}
                className="hero-enter-h1 mt-6 text-balance text-[2.5rem] font-bold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.3rem]"
              >
                {titleLead}{' '}
                <em className="inline-block bg-[linear-gradient(95deg,#a5f0e0_5%,#3dddc4_45%,#2a9184_95%)] bg-clip-text pr-1.5 font-normal italic text-transparent [font-family:var(--font-instrument-serif),Georgia,serif]">
                  {titleAccent}
                </em>
              </h1>

              <p
                style={{ animationDelay: '0.16s' }}
                className="hero-enter mx-auto mt-6 max-w-xl text-pretty text-[1.02rem] leading-[1.75] text-[var(--text-soft)] sm:text-[1.12rem] sm:leading-8 lg:mx-0"
              >
                {lede}
              </p>
            </div>

            {/* Foto founder: mismo tratamiento que el teaser de la home (marco teal + glow) */}
            <Reveal variant="surface" delay={0.12}>
              <Parallax offset={26} className="mx-auto w-full max-w-[380px] lg:max-w-[440px]">
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
                    priority
                    sizes="(max-width: 1024px) 80vw, 440px"
                    className="w-full object-cover"
                  />
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-[1px] rounded-[calc(2rem-1px)] border border-white/8"
                  />
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
          </div>
        </section>

        {/* Historia: kicker en columna propia + párrafos con tipografía de lectura */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl gap-12 lg:grid lg:grid-cols-[220px_1fr]">
            <Reveal variant="section">
              <p className="section-kicker lg:sticky lg:top-32">{labels.storyKicker}</p>
            </Reveal>

            <div className="mt-8 max-w-prose space-y-7 lg:mt-0">
              {storyRest.map((paragraph, index) => (
                <Reveal key={paragraph.slice(0, 24)} variant="section" delay={index * 0.05}>
                  <p className="text-pretty text-lg leading-[1.8] text-white/78 sm:text-xl sm:leading-[1.85]">
                    {paragraph}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Stack agrupado: 3 bloques con label + chips */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <SectionHeading eyebrow={labels.stackKicker} title={labels.stackTitle} />
            </Reveal>

            <StaggerReveal className="mt-10 grid gap-4 sm:mt-12 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {about.stackGroups.map((group) => (
                <StaggerItem key={group.label} className="h-full">
                  <article className="h-full rounded-[1.7rem] border border-[var(--surface-border)] bg-white/[0.02] p-6 transition duration-300 hover:border-[rgba(61,221,196,0.18)] hover:bg-white/[0.03] sm:p-7">
                    <h3 className="text-lg font-medium leading-snug tracking-[-0.02em] text-white">
                      {group.label}
                    </h3>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[13px] font-medium text-white/70"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* Certificaciones: cards estáticas con la imagen del certificado */}
        <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <Reveal variant="section">
              <SectionHeading eyebrow={labels.certsKicker} title={labels.certsTitle} />
            </Reveal>

            <StaggerReveal className="mt-10 grid gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3">
              {about.certifications.map((cert) => (
                <StaggerItem key={cert.id} className="h-full">
                  <article className="flex h-full flex-col overflow-hidden rounded-[1.7rem] border border-[var(--surface-border)] bg-white/[0.02] transition duration-300 hover:border-[rgba(61,221,196,0.22)] hover:bg-white/[0.03] hover:shadow-[0_18px_56px_rgba(0,0,0,0.4),0_0_36px_rgba(61,221,196,0.08)]">
                    {/* Los certificados son oscuros: object-contain sobre fondo oscuro
                        preserva bordes (logos/firmas) sin letterbox visible. */}
                    <div className="relative aspect-[16/11] border-b border-[var(--surface-border)] bg-[#0b0d12]">
                      <Image
                        src={cert.image}
                        alt={labels.certAlt(cert.title, cert.issuer)}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
                        className="object-contain"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h3 className="text-lg font-medium leading-snug tracking-[-0.02em] text-white">
                        {cert.title}
                      </h3>
                      <p className="mt-auto pt-2.5 text-sm leading-6 text-white/55">
                        {cert.issuer} · {cert.date}
                      </p>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerReveal>
          </div>
        </section>

        {/* CTA final: WhatsApp directo + fallback al form de la home */}
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
                    href={buildWhatsAppUrl(labels.whatsappMessage)}
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
