'use client'

import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCheck, ShieldCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type MsgFrom = 'user' | 'bot' | 'system'
type Msg = { from: MsgFrom; text: string }
type BranchKey = 'turno' | 'precio' | 'urgencia'

/**
 * Guiones por rama. La última línea de cada rama es SIEMPRE un mensaje
 * `system` con el resultado de negocio (qué quedó hecho detrás del chat).
 */
const BRANCHES: Record<BranchKey, { es: Msg[]; en: Msg[] }> = {
  turno: {
    es: [
      { from: 'bot', text: '¡Hola! Soy el asistente del consultorio. ¿Querés sacar un turno? 🗓️' },
      { from: 'user', text: 'Sí, para esta semana' },
      {
        from: 'bot',
        text: 'Tengo jueves 10:30 o viernes 16:00 con la Dra. Pérez. ¿Cuál te queda mejor?',
      },
      { from: 'user', text: 'Jueves' },
      { from: 'bot', text: 'Listo ✅ Jueves 10:30. Te mando recordatorio el miércoles. ¿Algo más?' },
      { from: 'system', text: 'Turno agendado · Lead guardado · Recordatorio programado' },
    ],
    en: [
      { from: 'bot', text: "Hi! I'm the clinic's assistant. Would you like to book an appointment? 🗓️" },
      { from: 'user', text: 'Yes, sometime this week' },
      {
        from: 'bot',
        text: 'I have Thursday 10:30 or Friday 16:00 with Dr. Pérez. Which one works better?',
      },
      { from: 'user', text: 'Thursday' },
      { from: 'bot', text: "Done ✅ Thursday 10:30. I'll send you a reminder on Wednesday. Anything else?" },
      { from: 'system', text: 'Appointment booked · Lead saved · Reminder scheduled' },
    ],
  },
  precio: {
    es: [
      { from: 'user', text: 'Hola, ¿cuánto sale la consulta?' },
      {
        from: 'bot',
        text: 'Hola 👋 La consulta particular sale $25.000. Con obra social depende del plan, ¿tenés alguna?',
      },
      { from: 'user', text: 'Tengo OSDE' },
      {
        from: 'bot',
        text: 'Con OSDE la cubrís al 100% ✅ ¿Querés que te agende un turno o preferís que te llame la secretaría?',
      },
      { from: 'user', text: 'Mejor que me llamen' },
      { from: 'bot', text: 'Perfecto, le paso tu contacto a la secretaría y te llaman hoy mismo 📞' },
      { from: 'system', text: 'Precio informado · Cobertura validada · Lead derivado a humano' },
    ],
    en: [
      { from: 'user', text: 'Hi, how much is a consultation?' },
      {
        from: 'bot',
        text: 'Hi 👋 A private consultation is $25,000. With insurance it depends on your plan — do you have one?',
      },
      { from: 'user', text: 'I have OSDE' },
      {
        from: 'bot',
        text: "With OSDE it's fully covered ✅ Want me to book you an appointment, or should the front desk call you?",
      },
      { from: 'user', text: 'Have them call me' },
      { from: 'bot', text: "Perfect — I'm passing your contact to the front desk, they'll call you today 📞" },
      { from: 'system', text: 'Price shared · Coverage validated · Lead handed to a human' },
    ],
  },
  urgencia: {
    es: [
      { from: 'user', text: 'Hola, necesito atención urgente' },
      {
        from: 'bot',
        text: 'Entiendo 🚨 Marqué tu consulta como prioritaria. ¿Me contás brevemente qué te pasa?',
      },
      { from: 'user', text: 'Dolor muy fuerte de muelas desde anoche' },
      {
        from: 'bot',
        text: 'Listo. Ya le avisé a la Dra. Pérez y te escribe en menos de 10 minutos. Si empeora, llamá al (0351) 555-0199.',
      },
      { from: 'system', text: 'Prioridad alta · Humano notificado · Respuesta en menos de 10 min' },
    ],
    en: [
      { from: 'user', text: 'Hi, I need urgent care' },
      {
        from: 'bot',
        text: "I understand 🚨 I've flagged your case as high priority. Can you briefly tell me what's going on?",
      },
      { from: 'user', text: 'Really bad toothache since last night' },
      {
        from: 'bot',
        text: "Done. I've alerted Dr. Pérez and she'll message you within 10 minutes. If it gets worse, call (0351) 555-0199.",
      },
      { from: 'system', text: 'High priority · Human notified · Reply in under 10 min' },
    ],
  },
}

const BRANCH_ORDER: BranchKey[] = ['turno', 'precio', 'urgencia']

const CHIP_LABELS: Record<BranchKey, Record<Locale, string>> = {
  turno: { es: 'Quiero un turno 🗓️', en: 'I want an appointment 🗓️' },
  precio: { es: '¿Cuánto cuesta?', en: 'How much is it?' },
  urgencia: { es: 'Tengo una urgencia', en: 'I have an emergency' },
}

const COPY = {
  es: {
    title: 'Consultorio Dra. Pérez',
    online: 'en línea',
    tag: 'simulación',
    prompt: '¿Qué le escribirías al negocio? Elegí y mirá cómo responde el bot:',
    next: 'Siguiente mensaje →',
    replay: '↺ Probar otra conversación',
    counterOf: 'de',
    logLabel: 'Conversación simulada con el bot',
  },
  en: {
    title: 'Dr. Pérez Clinic',
    online: 'online',
    tag: 'simulation',
    prompt: 'What would you text the business? Pick one and watch the bot reply:',
    next: 'Next message →',
    replay: '↺ Try another conversation',
    counterOf: 'of',
    logLabel: 'Simulated conversation with the bot',
  },
} as const

function MessageBubble({ message }: { message: Msg }) {
  const reduceMotion = useReducedMotion()

  if (message.from === 'system') {
    return (
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="flex justify-center pt-1"
      >
        <p className="inline-flex items-center gap-2 rounded-xl border border-[rgba(61,221,196,0.3)] bg-[rgba(31,127,115,0.14)] px-3.5 py-2 text-center font-mono text-[10px] uppercase leading-relaxed tracking-[0.12em] text-[#8ceada]">
          <ShieldCheck size={13} strokeWidth={2.2} aria-hidden className="shrink-0" />
          {message.text}
        </p>
      </motion.div>
    )
  }

  const isUser = message.from === 'user'

  return (
    <motion.div
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm leading-6 sm:max-w-[78%]',
          isUser
            ? 'rounded-br-md border-[rgba(61,221,196,0.25)] bg-[rgba(61,221,196,0.14)] text-white/92'
            : 'rounded-bl-md border-white/10 bg-white/5 text-white/85',
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {isUser ? (
          <span aria-hidden className="mt-1 flex justify-end text-[#3dddc4]/70">
            <CheckCheck size={13} strokeWidth={2.2} />
          </span>
        ) : null}
      </div>
    </motion.div>
  )
}

/**
 * Simulador de conversación de WhatsApp con ramas elegibles. El visitante
 * elige cómo arranca la charla (turno / precio / urgencia) y revela los
 * mensajes uno a uno a su ritmo; al final ve el resultado de negocio y puede
 * probar otra rama. Sin red: todo el guion es local.
 */
export function WhatsappSim({ locale }: { locale: Locale }) {
  const copy = COPY[locale]

  const [branch, setBranch] = useState<BranchKey | null>(null)
  const [revealed, setRevealed] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const script = branch ? BRANCHES[branch][locale] : []
  const finished = branch !== null && revealed >= script.length

  const pickBranch = (key: BranchKey) => {
    setBranch(key)
    setRevealed(1)
  }

  const reset = () => {
    setBranch(null)
    setRevealed(0)
  }

  // Auto-scroll al último mensaje revelado.
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [revealed])

  return (
    <div data-testid="micro-demo" className="relative">
      {/* Header estilo WhatsApp */}
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.03] px-4 py-3.5 sm:px-5">
        <span
          aria-hidden
          className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3dddc4,#1f7f73)] text-xs font-semibold text-slate-950"
        >
          DP
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0b1422] bg-emerald-400" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white">{copy.title}</p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-300/90">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
            {copy.online}
          </p>
        </div>
        <span className="ml-auto hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 sm:block">
          {copy.tag}
        </span>
      </div>

      {/* Mensajes / selector de rama */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label={copy.logLabel}
        className="h-[300px] overflow-y-auto bg-[radial-gradient(120%_90%_at_50%_0%,rgba(61,221,196,0.05),transparent_55%)] px-4 py-5 [scrollbar-width:thin] sm:h-[330px] sm:px-5"
      >
        {branch === null ? (
          <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
            <p className="max-w-xs text-sm leading-6 text-white/60">{copy.prompt}</p>
            <div className="flex w-full max-w-xs flex-col gap-2.5">
              {BRANCH_ORDER.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => pickBranch(key)}
                  className="group flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-[rgba(61,221,196,0.22)] bg-[rgba(61,221,196,0.06)] px-4.5 py-3 text-left text-sm font-medium text-[#a5f0e0] transition hover:border-[rgba(61,221,196,0.5)] hover:bg-[rgba(61,221,196,0.12)] active:scale-[0.98]"
                >
                  {CHIP_LABELS[key][locale]}
                  <ArrowRight
                    size={15}
                    strokeWidth={2.2}
                    aria-hidden
                    className="shrink-0 text-[#3dddc4]/70 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                  />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {script.slice(0, revealed).map((message, index) => (
              <MessageBubble key={`${branch}-${index}`} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Controles: avanzar el guion o reiniciar */}
      <div className="border-t border-white/[0.07] bg-white/[0.02] px-4 py-4 sm:px-5">
        {branch === null ? (
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.24em] text-white/30">
            {locale === 'es' ? '3 conversaciones posibles' : '3 possible conversations'}
          </p>
        ) : finished ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(61,221,196,0.08)] px-5 py-3 text-sm font-semibold text-[#8ceada] transition hover:border-[rgba(61,221,196,0.5)] hover:bg-[rgba(61,221,196,0.14)] active:scale-[0.985]"
          >
            {copy.replay}
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setRevealed((count) => Math.min(count + 1, script.length))}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_32px_rgba(31,127,115,0.32)] transition hover:brightness-110 active:scale-[0.985]"
            >
              {copy.next}
            </button>
            <span
              aria-hidden
              className="shrink-0 font-mono text-[10px] tracking-[0.14em] text-white/35"
            >
              {revealed} {copy.counterOf} {script.length}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
