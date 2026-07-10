import { Parallax } from '@/components/motion/parallax'
import { ProjectsDeck } from '@/components/motion/projects-deck'
import { Reveal } from '@/components/motion/reveal'
import { ProjectFrame, PROJECT_FRAME_KINDS } from '@/components/ui/project-frame'
import { SectionHeading } from '@/components/ui/section-heading'
import { cn } from '@/lib/utils'
import { getDictionary, localizedPath } from '@/lib/i18n'
import type { Locale, ProjectContent, ProjectId } from '@/types/content'
import { ArrowRight, Check } from 'lucide-react'
import Link from 'next/link'

const ORDER: ProjectId[] = ['pyron', 'pulso', 'bot-ime', 'orbita']

/** Chips visibles: 3 en la card compacta mobile, 4 en desktop. */
const MAX_CHIPS = 4
const MAX_CHIPS_MOBILE = 3

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
  const extraChipsMobile = project.stack.length - MAX_CHIPS_MOBILE

  return (
    // Fondo OPACO a propósito (no --surface-strong translúcido): las cards se
    // apilan una sobre otra y la de abajo no puede traslucirse por legibilidad.
    // h-full: en el carousel mobile todas las cards igualan a la más alta.
    <article className="h-full overflow-hidden rounded-[2rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#0b1422_0%,#070d17_100%)] shadow-[var(--surface-shadow-strong)] lg:h-auto">
      <div className="grid h-full grid-rows-[auto_1fr] lg:h-auto lg:grid-cols-2 lg:grid-rows-none">
        {/* Frame de dispositivo (arriba en mobile, derecha en desktop) */}
        <div className="order-1 flex items-center justify-center border-b border-[var(--surface-border)] bg-white/[0.015] p-4 sm:p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-10">
          <Parallax offset={14} className="w-full">
            <ProjectFrame
              project={{ id: project.id, name: project.name, image: project.image }}
              kind={PROJECT_FRAME_KINDS[project.id]}
              captureAlt={captureAlt}
              compactOnMobile
            />
          </Parallax>
        </div>

        {/* Info */}
        <div className="order-2 flex flex-col p-5 sm:p-9 lg:order-1 lg:p-11">
          <span aria-hidden className="font-mono text-xs tracking-[0.35em] text-[#3dddc4]/75">
            {String(index + 1).padStart(2, '0')}
          </span>

          <h3 className="mt-3 text-[1.35rem] font-medium leading-[1.05] tracking-[-0.05em] text-white sm:mt-4 sm:text-[2.05rem]">
            {project.name}
          </h3>

          <p className="mt-2 text-base italic leading-snug text-[#7fe8d6] [font-family:var(--font-instrument-serif),Georgia,serif] sm:mt-3 sm:text-xl">
            {project.tagline}
          </p>

          {/* Mobile compacto: 1 resultado; desktop mantiene los 2. */}
          <ul className="mt-4 space-y-2.5 sm:mt-6">
            {project.results.slice(0, 2).map((result, resultIndex) => (
              <li
                key={result}
                className={cn(
                  'flex items-start gap-3 text-[13px] leading-5 text-white/72 sm:text-sm sm:leading-6',
                  resultIndex > 0 && 'hidden lg:flex',
                )}
              >
                <Check size={15} strokeWidth={2.4} aria-hidden className="mt-0.5 shrink-0 text-[#3dddc4] sm:mt-1" />
                {result}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
            {project.stack.slice(0, MAX_CHIPS).map((tech, techIndex) => (
              <span
                key={tech}
                className={cn(
                  'rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] font-medium text-white/60',
                  techIndex >= MAX_CHIPS_MOBILE && 'hidden lg:inline-flex',
                )}
              >
                {tech}
              </span>
            ))}
            {extraChipsMobile > 0 ? (
              <span className="rounded-full border border-[rgba(61,221,196,0.2)] bg-[rgba(61,221,196,0.06)] px-3 py-1 text-[11px] font-medium text-[#3dddc4]/85 lg:hidden">
                +{extraChipsMobile}
              </span>
            ) : null}
            {extraChips > 0 ? (
              <span className="hidden rounded-full border border-[rgba(61,221,196,0.2)] bg-[rgba(61,221,196,0.06)] px-3 py-1 text-[11px] font-medium text-[#3dddc4]/85 lg:inline-flex">
                +{extraChips}
              </span>
            ) : null}
          </div>

          <Link
            href={href}
            className="group mt-auto inline-flex items-center gap-2 self-start pt-5 text-sm font-semibold text-[#3dddc4] lg:pt-8"
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
 * Server component: casos reales. En mobile, carousel horizontal snap con
 * cards compactas e indicador de progreso; en desktop, sticky-stack (cada
 * card se pinnea y la siguiente scrollea por encima). Frames de dispositivo
 * con placeholder tintado hasta que lleguen las capturas reales.
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
    <section id={sectionId} className="px-4 py-14 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="section">
          <SectionHeading
            eyebrow={kicker}
            title={dict.home.projects.title}
            description={dict.home.projects.sub}
          />
        </Reveal>

        <ProjectsDeck items={items} className="mt-8 sm:mt-16" />
      </div>
    </section>
  )
}
