import { Reveal } from '@/components/motion/reveal'
import { ProcessRun } from '@/components/sections/process-run'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary } from '@/lib/i18n'
import type { Locale } from '@/types/content'

/**
 * Server component: «Cómo trabajo» como una ejecución — los pasos del
 * diccionario y la consola proceso.run que avanza con el scroll
 * (ProcessRun). Diseño: docs/superpowers/specs/2026-09-27-proceso-en-vivo-design.md
 */
export function ProcessSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const { process } = dict.home
  const sectionId = locale === 'es' ? 'proceso' : 'process'
  const kicker =
    dict.common.nav.find((item) => item.href === `/#${sectionId}`)?.label ??
    process.title

  return (
    <section id={sectionId} className="px-4 py-14 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal variant="section">
          <SectionHeading eyebrow={kicker} title={process.title} />
        </Reveal>

        <div className="mt-8 sm:mt-14">
          <ProcessRun steps={process.steps} consoleCopy={process.console} />
        </div>
      </div>
    </section>
  )
}
