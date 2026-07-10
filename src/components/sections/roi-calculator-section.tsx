import { ROICalculator } from '@/components/roi/roi-calculator'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary } from '@/lib/i18n'
import type { Locale } from '@/types/content'

/**
 * Server component: calculadora ROI localizada. La fórmula vive en
 * src/lib/roi.ts; acá solo se resuelve el copy del diccionario y se pasa
 * al client component por props. El id es "roi" en ambos idiomas.
 */
export function RoiCalculatorSection({ locale }: { locale: Locale }) {
  const { roi } = getDictionary(locale).home

  return (
    <section id="roi" className="px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal variant="section">
          <SectionHeading eyebrow={roi.eyebrow} title={roi.title} description={roi.sub} />
        </Reveal>

        <Reveal variant="surface" delay={0.1}>
          <ROICalculator labels={roi.calculator} />
        </Reveal>
      </div>
    </section>
  )
}
