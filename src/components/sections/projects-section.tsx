import { Parallax } from '@/components/motion/parallax'
import { Reveal } from '@/components/motion/reveal'
import { StickyStack } from '@/components/motion/sticky-stack'
import { ProjectFrame, type ProjectFrameKind } from '@/components/ui/project-frame'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale, ProjectContent, ProjectId } from '@/types/content'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

const ORDER: ProjectId[] = ['pyron', 'pulso', 'bot-ime', 'orbita']

const FRAME_KINDS: Record<ProjectId, ProjectFrameKind> = {
  pyron: 'browser',
  pulso: 'phone',
  'bot-ime': 'chat',
  orbita: 'browser',
}

const MAX_CHIPS = 4

function ProjectCard({
  project,
  index,
  href,
  caseLabel,
  captureAlt,
}: {
  project: ProjectContent
  index: number
  href: string
  caseLabel: string
  captureAlt: string
}) {
  const extraChips = project.stack.length - MAX_CHIPS

  return (
    // Fondo OPACO a propósito (no --surface-strong translúcido): las cards se
    // apilan una sobre otra y la de abajo no puede traslucirse por legibilidad.
    <article className="overflow-hidden rounded-[2rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#0b1422_0%,#070d17_100%)] shadow-[var(--surface-shadow-strong)]">
      <div className="grid lg:grid-cols-2">
        {/* Frame de dispositivo (arriba en mobile, derecha en desktop) */}
        <div className="order-1 flex items-center justify-center border-b border-[var(--surface-border)] bg-white/[0.015] p-5 sm:p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-10">
          <Parallax offset={14} className="w-full">
            <ProjectFrame
              project={{ id: project.id, name: project.name, image: project.image }}
              kind={FRAME_KINDS[project.id]}
              captureAlt={captureAlt}
            />
          </Parallax>
        </div>

        {/* Info */}
        <div className="order-2 flex flex-col p-6 sm:p-9 lg:order-1 lg:p-11">
          <span aria-hidden className="font-mono text-xs tracking-[0.35em] text-[#3dddc4]/75">
            {String(index + 1).padStart(2, '0')}
          </span>

          <h3 className="mt-4 text-[1.65rem] font-medium leading-[1.05] tracking-[-0.05em] text-white sm:text-[2.05rem]">
            {project.name}
          </h3>

          <p className="mt-3 text-lg italic leading-snug text-[#7fe8d6] [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-xl">
            {project.tagline}
          </p>

          <ul className="mt-6 space-y-2.5">
            {project.results.slice(0, 2).map((result) => (
              <li key={result} className="flex items-start gap-3 text-sm leading-6 text-white/72">
                <Check size={15} strokeWidth={2.4} className="mt-1 shrink-0 text-[#3dddc4]" />
                {result}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-wrap gap-2">
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

          <Link
            href={href}
            className="group mt-8 inline-flex items-center gap-2 self-start text-sm font-semibold text-[#3dddc4] lg:mt-auto lg:pt-8"
          >
            {caseLabel}
            <ArrowRight
              size={15}
              aria-hidden
              className="transition-transform duration-300 motion-safe:group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  )
}

/**
 * Server component: casos reales apilados con sticky-stack (cada card se
 * pinnea y la siguiente scrollea por encima). Frames de dispositivo con
 * placeholder tintado hasta que lleguen las capturas reales.
 */
export function ProjectsSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const sectionId = locale === 'es' ? 'proyectos' : 'projects'
  const basePath = locale === 'es' ? '/proyectos/' : '/projects/'
  const caseLabel = locale === 'es' ? 'Ver el caso' : 'View case'
  const captureAlt = (name: string) =>
    locale === 'es' ? `Captura de ${name}` : `${name} screenshot`
  const kicker =
    dict.common.nav.find((item) => item.href === (locale === 'es' ? '/proyectos' : '/projects'))
      ?.label ?? dict.home.projects.title

  const items = ORDER.map((id, index) => {
    const project = dict.projects[id]

    return (
      <ProjectCard
        key={id}
        project={project}
        index={index}
        href={localizedPath(locale, `${basePath}${project.slug}`)}
        caseLabel={caseLabel}
        captureAlt={captureAlt(project.name)}
      />
    )
  })

  return (
    <section id={sectionId} className="px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="section">
          <SectionHeading
            eyebrow={kicker}
            title={dict.home.projects.title}
            description={dict.home.projects.sub}
          />
        </Reveal>

        <StickyStack items={items} className="mt-12 sm:mt-16" />
      </div>
    </section>
  )
}
