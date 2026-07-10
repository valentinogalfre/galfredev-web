import { DrawLine } from '@/components/motion/draw-line'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { Check } from 'lucide-react'

/**
 * Server component: timeline vertical de 3 pasos con línea que se dibuja al
 * scrollear (izquierda en mobile, centro alternando lados en desktop).
 */
export function ProcessSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const { process } = dict.home
  const sectionId = locale === 'es' ? 'proceso' : 'process'
  const kicker =
    dict.common.nav.find((item) => item.href === `/#${sectionId}`)?.label ??
    process.title

  return (
    <section id={sectionId} className="px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="section">
          <SectionHeading eyebrow={kicker} title={process.title} align="center" />
        </Reveal>

        <div className="relative mt-14 sm:mt-16 lg:mt-24">
          <DrawLine className="left-[11px] -translate-x-1/2 lg:left-1/2" />

          <ol className="space-y-16 lg:space-y-24">
            {process.steps.map((step, index) => {
              const left = index % 2 === 0

              return (
                <li key={step.title} className="relative pl-10 sm:pl-14 lg:pl-0">
                  {/* Nodo sobre la línea */}
                  <span
                    aria-hidden
                    className="absolute left-[11px] top-3 z-10 h-3 w-3 -translate-x-1/2 rounded-full border border-[#3dddc4]/70 bg-[#07101d] shadow-[0_0_18px_rgba(61,221,196,0.55)] lg:left-1/2 lg:top-6"
                  >
                    <span className="absolute inset-[3px] rounded-full bg-[#3dddc4]/80" />
                  </span>

                  <Reveal
                    variant="section"
                    x={left ? -14 : 14}
                    className="lg:grid lg:grid-cols-2 lg:gap-x-24"
                  >
                    <div
                      className={cn(
                        'max-w-xl',
                        left
                          ? 'lg:col-start-1 lg:justify-self-end lg:pr-2'
                          : 'lg:col-start-2 lg:pl-2',
                      )}
                    >
                      <span
                        aria-hidden
                        className="block select-none bg-[linear-gradient(95deg,#a5f0e0_5%,#3dddc4_45%,#2a9184_95%)] bg-clip-text text-[3.4rem] italic leading-none text-transparent [font-family:var(--font-instrument-serif),Georgia,serif] sm:text-[4.2rem]"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <h3 className="mt-4 text-[1.55rem] font-medium leading-[1.06] tracking-[-0.05em] text-white sm:text-[1.95rem]">
                        {step.title}
                      </h3>

                      <p className="mt-4 max-w-lg text-sm leading-7 text-white/60 sm:text-base sm:leading-8">
                        {step.description}
                      </p>

                      <p className="mt-6 flex items-start gap-3 border-l-2 border-[#3dddc4]/50 pl-4 text-sm leading-7 text-white/80 sm:text-[15px]">
                        <Check
                          size={16}
                          strokeWidth={2.4}
                          aria-hidden
                          className="mt-1.5 shrink-0 text-[#3dddc4]"
                        />
                        {step.outcome}
                      </p>
                    </div>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
