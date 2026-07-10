import type { AutoplayMessage } from '@/components/demos/bot-chat'
import { BotChatLive } from '@/components/demos/bot-chat-live'
import { Reveal } from '@/components/motion/reveal'
import { SectionHeading } from '@/components/ui/section-heading'
import { getDictionary } from '@/lib/i18n'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { Locale } from '@/types/content'

// Conversación demo que se reproduce sola al entrar la sección al viewport.
// OJO: no repetir frases de src/lib/demo-bot-script.ts — los e2e asertan
// texto de las respuestas guionadas y un duplicado rompe el strict mode.
const AUTOPLAY_SCRIPT: Record<Locale, AutoplayMessage[]> = {
  es: [
    { from: 'user', text: 'Hola! Tengo una barbería y pierdo turnos por no llegar a contestar 😩' },
    {
      from: 'bot',
      text: 'Para eso estoy 💈 Un bot responde al instante, muestra los horarios libres y agenda el turno solo — vos te enterás con la agenda ya cargada. ¿Cuántas consultas reciben por día?',
    },
    { from: 'user', text: 'Unas 30… ¿y cuánto me saldría algo así?' },
    {
      from: 'bot',
      text: 'Menos que los turnos que se te escapan por mes 😉 Pasame los detalles por WhatsApp y en el día te armo un presupuesto cerrado.',
    },
  ],
  en: [
    { from: 'user', text: "Hi! I run a barbershop and I lose bookings because I can't reply in time 😩" },
    {
      from: 'bot',
      text: "That's exactly my thing 💈 A bot replies instantly, shows open slots and books the appointment on its own — you just see the calendar fill up. How many enquiries do you get a day?",
    },
    { from: 'user', text: 'Around 30… and what would that run me?' },
    {
      from: 'bot',
      text: "Less than the bookings you lose every month 😉 Send me the details on WhatsApp and I'll put together a firm quote within the day.",
    },
  ],
}

const SUGGESTIONS: Record<Locale, string[]> = {
  es: ['¿Qué hace un bot?', '¿Cuánto sale?', 'Quiero una web'],
  en: ['What can a bot do?', 'How much is it?', 'I want a website'],
}

/**
 * Server component: demo interactiva del bot conectada a /api/demo-bot vía
 * BotChatLive (live con Claude si hay credenciales; si no, guionado — y ante
 * cualquier falla degrada al guion local). Chat centrado con autoplay + chips.
 */
export function BotDemoSection({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale)
  const kicker = locale === 'es' ? 'Demo en vivo' : 'Live demo'

  return (
    <section id="demo" className="px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal variant="section">
          <SectionHeading
            eyebrow={kicker}
            title={dict.home.botDemo.title}
            description={dict.home.botDemo.sub}
            align="center"
          />
        </Reveal>

        <Reveal variant="surface" delay={0.12} className="relative mx-auto mt-12 max-w-xl sm:mt-16">
          {/* Glow ambiental detrás de la ventana */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-16 -top-14 bottom-0 -z-10 bg-[radial-gradient(60%_55%_at_50%_30%,rgba(61,221,196,0.12),transparent_70%)] blur-2xl"
          />
          <BotChatLive
            locale={locale}
            inputPlaceholder={dict.home.botDemo.inputPlaceholder}
            limitNote={dict.home.botDemo.limitNote}
            whatsappUrl={buildWhatsAppUrl(dict.common.whatsappBaseMessage)}
            autoplayScript={AUTOPLAY_SCRIPT[locale]}
            suggestions={SUGGESTIONS[locale]}
          />
        </Reveal>
      </div>
    </section>
  )
}
