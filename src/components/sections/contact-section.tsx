import { Reveal } from '@/components/motion/reveal'
import { ContactForm } from '@/components/ui/contact-form'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary } from '@/lib/i18n'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Locale } from '@/types/content'
import { ArrowRight } from 'lucide-react'

/**
 * Server component: cierre de la home. Columna izquierda con el pitch y el
 * CTA directo a WhatsApp; columna derecha con el form de leads (client).
 * El POST a /api/lead no cambia. id localizado: #contacto / #contact.
 */
export function ContactSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const { contact } = dict.home
  const sectionId = locale === 'es' ? 'contacto' : 'contact'
  const kicker =
    dict.common.nav.find((item) => item.href === `/#${sectionId}`)?.label ??
    contact.title

  return (
    <section id={sectionId} className="px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-8">
        <Reveal variant="section">
          <SectionHeading eyebrow={kicker} title={contact.title} description={contact.sub} />

          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-[var(--text-soft)] sm:text-lg">
            {contact.intro}
          </p>

          <div className="mt-8 space-y-4">
            <a
              href={buildWhatsAppUrl(contact.whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.18)] transition duration-300 hover:translate-y-[-1px] hover:shadow-[0_18px_48px_rgba(31,127,115,0.24)]"
            >
              {contact.whatsappCta}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </a>
            <p className="max-w-md text-sm leading-7 text-white/56">{contact.formNote}</p>
          </div>
        </Reveal>

        <Reveal delay={0.06} variant="surface">
          <ContactForm labels={contact.form} />
        </Reveal>
      </div>
    </section>
  )
}
