import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { Parallax } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { ProjectsFilter } from '@/components/pages/projects-filter'
import { ProjectFrame, PROJECT_FRAME_KINDS } from '@/components/ui/project-frame'
import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale, ProjectContent, ProjectId } from '@/types/content'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

/** Chrome de página no cubierto por el dict (títulos vienen de home.projects). */
const LABELS = {
  es: {
    allFilter: 'Todos',
    filterGroup: 'Filtrar por servicio',
    caseLabel: 'Ver el caso',
    captureAlt: (name: string) => `Captura de ${name}`,
  },
  en: {
    allFilter: 'All',
    filterGroup: 'Filter by service',
    caseLabel: 'View case',
    captureAlt: (name: string) => `${name} screenshot`,
  },
} as const

/** Mismo orden editorial que la home. */
const ORDER: ProjectId[] = ['pyron', 'pulso', 'bot-ime', 'orbita']

const MAX_CHIPS = 4

function ProjectCard({
  project,
  href,
  caseLabel,
  captureAlt,
}: {
  project: ProjectContent
  href: string
  caseLabel: string
  captureAlt: string
}) {
  const extraChips = project.stack.length - MAX_CHIPS

  return (
    <Link href={href} className="group block h-full">
      <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#0b1422_0%,#070d17_100%)] transition duration-300 hover:border-[rgba(61,221,196,0.22)] hover:shadow-[var(--surface-shadow-strong)]">
        <div className="flex items-center justify-center border-b border-[var(--surface-border)] bg-white/[0.015] p-5 sm:p-7">
          <Parallax offset={10} className="w-full">
            <ProjectFrame
              project={{ id: project.id, name: project.name, image: project.image }}
              kind={PROJECT_FRAME_KINDS[project.id]}
              captureAlt={captureAlt}
            />
          </Parallax>
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-8">
          <h2 className="text-2xl font-medium leading-[1.05] tracking-[-0.04em] text-white sm:text-[1.75rem]">
            {project.name}
          </h2>

          <p className="mt-2.5 text-lg italic leading-snug text-[#7fe8d6] [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-xl">
            {project.tagline}
          </p>

          <ul className="mt-5 space-y-2.5">
            {project.results.slice(0, 2).map((result) => (
              <li key={result} className="flex items-start gap-3 text-sm leading-6 text-white/72">
                <Check size={15} strokeWidth={2.4} aria-hidden className="mt-1 shrink-0 text-[#3dddc4]" />
                {result}
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.stack.slice(0, MAX_CHIPS).map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/60"
              >
                {tech}
              </span>
            ))}
            {extraChips > 0 ? (
              <span className="rounded-full border border-[rgba(61,221,196,0.2)] bg-[rgba(61,221,196,0.06)] px-3 py-1 text-[11px] font-medium text-[#3dddc4]/85">
                +{extraChips}
              </span>
            ) : null}
          </div>

          <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-[#3dddc4]">
            {caseLabel}
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            />
          </span>
        </div>
      </article>
    </Link>
  )
}

/**
 * Server component: índice del portfolio — hero compacto + grilla de casos
 * con filtro por servicio (client-side, ProjectsFilter). Las cards se
 * renderizan acá (ProjectFrame es server-only) y viajan como ReactNode.
 */
export function ProjectsIndexPage({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const labels = LABELS[locale]
  const projectsBase = locale === 'es' ? '/proyectos/' : '/projects/'
  const kicker =
    dict.common.nav.find((item) => item.href === (locale === 'es' ? '/proyectos' : '/projects'))
      ?.label ?? dict.home.projects.title

  const filters = Object.values(dict.services).map((service) => ({
    id: service.id,
    name: service.name,
  }))

  const items = ORDER.map((id) => {
    const project = dict.projects[id]

    return {
      id,
      services: project.services,
      card: (
        <ProjectCard
          project={project}
          href={localizedPath(locale, `${projectsBase}${project.slug}`)}
          caseLabel={labels.caseLabel}
          captureAlt={labels.captureAlt(project.name)}
        />
      ),
    }
  })

  return (
    <>
      <SiteHeader locale={locale} />
      <main id="contenido-principal" className="relative overflow-x-clip">
        {/* Hero compacto de página interior (mismo lenguaje que servicios) */}
        <section className="relative overflow-hidden px-4 pb-12 pt-32 sm:px-6 sm:pb-14 sm:pt-40 lg:px-8">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_50%_-12%,rgba(31,127,115,0.22),transparent_58%),radial-gradient(ellipse_at_12%_16%,rgba(31,127,115,0.08),transparent_42%),radial-gradient(ellipse_at_88%_8%,rgba(255,180,106,0.05),transparent_36%)]" />
          </div>

          <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <span className="hero-enter inline-flex items-center gap-2.5 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(31,127,115,0.1)] px-4 py-1.5 font-mono text-[9px] tracking-[0.12em] text-[#8ceada] sm:text-[11px] sm:tracking-[0.16em]">
              <span className="relative inline-flex size-1.5 shrink-0">
                <span className="absolute inline-flex size-full rounded-full bg-[#3dddc4] opacity-60 motion-safe:animate-ping" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#3dddc4] shadow-[0_0_10px_#3dddc4]" />
              </span>
              {kicker}
            </span>

            <h1
              style={{ animationDelay: '0.08s' }}
              className="hero-enter-h1 mt-6 text-balance text-[2.5rem] font-bold leading-[1.04] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.2rem]"
            >
              {dict.home.projects.title}
            </h1>

            <p
              style={{ animationDelay: '0.16s' }}
              className="hero-enter mt-5 max-w-2xl text-pretty text-[0.95rem] leading-[1.65] text-[var(--text-soft)] sm:text-[1.08rem] sm:leading-8"
            >
              {dict.home.projects.sub}
            </p>
          </div>
        </section>

        {/* Filtro por servicio + grilla de casos */}
        <section className="px-4 pb-24 pt-6 sm:px-6 sm:pb-28 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <Reveal variant="surface">
              <ProjectsFilter
                allLabel={labels.allFilter}
                groupLabel={labels.filterGroup}
                filters={filters}
                items={items}
              />
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter locale={locale} />
    </>
  )
}
