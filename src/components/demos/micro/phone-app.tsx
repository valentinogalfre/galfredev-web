'use client'

import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  CalendarDays,
  Check,
  CirclePlus,
  CircleUser,
  Paintbrush,
  Scissors,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { useState } from 'react'

type TabId = 'agenda' | 'nuevo' | 'perfil'
type ApptStatus = 'confirmado' | 'pendiente' | 'cancelado'
type NewStep = 'servicio' | 'horario' | 'listo'

const TAB_ORDER: TabId[] = ['agenda', 'nuevo', 'perfil']

const TABS: Record<TabId, { icon: LucideIcon; label: Record<Locale, string> }> = {
  agenda: { icon: CalendarDays, label: { es: 'Agenda', en: 'Agenda' } },
  nuevo: { icon: CirclePlus, label: { es: 'Nuevo', en: 'New' } },
  perfil: { icon: CircleUser, label: { es: 'Perfil', en: 'Profile' } },
}

const STATUS_CYCLE: ApptStatus[] = ['confirmado', 'pendiente', 'cancelado']

const STATUS_STYLES: Record<ApptStatus, string> = {
  confirmado: 'border-[rgba(61,221,196,0.35)] bg-[rgba(61,221,196,0.12)] text-[#8ceada]',
  pendiente: 'border-amber-300/35 bg-amber-300/10 text-amber-200',
  cancelado: 'border-rose-400/35 bg-rose-400/10 text-rose-300',
}

const STATUS_LABELS: Record<ApptStatus, Record<Locale, string>> = {
  confirmado: { es: 'confirmado', en: 'confirmed' },
  pendiente: { es: 'pendiente', en: 'pending' },
  cancelado: { es: 'cancelado', en: 'cancelled' },
}

const APPOINTMENTS: { time: string; name: string; service: Record<Locale, string> }[] = [
  { time: '09:30', name: 'Marcos Gil', service: { es: 'Corte', en: 'Cut' } },
  { time: '11:00', name: 'Sofía Peralta', service: { es: 'Color', en: 'Color' } },
  { time: '16:30', name: 'Juan Cruz', service: { es: 'Corte + barba', en: 'Cut + beard' } },
]

const SERVICES: { icon: LucideIcon; name: Record<Locale, string>; duration: string }[] = [
  { icon: Scissors, name: { es: 'Corte', en: 'Cut' }, duration: '30 min' },
  { icon: Paintbrush, name: { es: 'Color', en: 'Color' }, duration: '90 min' },
  { icon: Sparkles, name: { es: 'Barba', en: 'Beard' }, duration: '20 min' },
]

const TIME_SLOTS = ['10:30', '11:30', '15:00', '17:30']

const COPY = {
  es: {
    appName: 'Turnos',
    today: 'Hoy · 3 turnos',
    agendaHint: 'Tocá un turno para cambiar su estado',
    pickService: 'Elegí el servicio',
    pickTime: 'Elegí el horario',
    back: '← Volver',
    confirmed: 'Turno confirmado',
    another: 'Agendar otro',
    profileName: 'Lumen Studio',
    profileRole: 'Peluquería · Córdoba',
    stats: [
      { label: 'Turnos este mes', value: '42' },
      { label: 'Asistencia', value: '96%' },
      { label: 'Rating', value: '4.9 ★' },
    ],
    nextAppt: 'Próximo turno',
    tablistLabel: 'Secciones de la app',
    hint: 'Una mini app de turnos, de verdad navegable: tocá las pestañas, agendá un turno.',
  },
  en: {
    appName: 'Bookings',
    today: 'Today · 3 appointments',
    agendaHint: 'Tap an appointment to change its status',
    pickService: 'Pick a service',
    pickTime: 'Pick a time',
    back: '← Back',
    confirmed: 'Appointment confirmed',
    another: 'Book another',
    profileName: 'Lumen Studio',
    profileRole: 'Hair salon · Córdoba',
    stats: [
      { label: 'Bookings this month', value: '42' },
      { label: 'Attendance', value: '96%' },
      { label: 'Rating', value: '4.9 ★' },
    ],
    nextAppt: 'Next appointment',
    tablistLabel: 'App sections',
    hint: 'A mini booking app you can actually navigate: tap the tabs, book an appointment.',
  },
} as const

/**
 * Teléfono navegable: marco iPhone CSS (mismo look que el project-frame
 * phone) con una mini app de turnos adentro — agenda con estados tapeables,
 * alta de turno en 2 taps y perfil con stats. Tabs reales (role="tab") con
 * transición slide entre pantallas.
 */
export function PhoneApp({ locale }: { locale: Locale }) {
  const copy = COPY[locale]
  const reduceMotion = useReducedMotion()

  const [{ tab, direction }, setTabState] = useState<{ tab: TabId; direction: 1 | -1 }>({
    tab: 'agenda',
    direction: 1,
  })
  const [statuses, setStatuses] = useState<ApptStatus[]>(['confirmado', 'pendiente', 'confirmado'])
  const [step, setStep] = useState<NewStep>('servicio')
  const [serviceIndex, setServiceIndex] = useState(0)
  const [time, setTime] = useState(TIME_SLOTS[0])

  const selectTab = (next: TabId) => {
    setTabState((current) => ({
      tab: next,
      direction: TAB_ORDER.indexOf(next) > TAB_ORDER.indexOf(current.tab) ? 1 : -1,
    }))
  }

  const cycleStatus = (index: number) => {
    setStatuses((current) =>
      current.map((status, i) =>
        i === index ? STATUS_CYCLE[(STATUS_CYCLE.indexOf(status) + 1) % STATUS_CYCLE.length] : status,
      ),
    )
  }

  const slideVariants = {
    enter: (dir: 1 | -1) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * 44 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: 1 | -1) => (reduceMotion ? { opacity: 0 } : { opacity: 0, x: dir * -44 }),
  }

  return (
    <div data-testid="micro-demo" className="relative flex flex-col items-center gap-5 px-4 py-7 sm:py-9">
      {/* Marco iPhone (mismo lenguaje que project-frame kind="phone") */}
      <div className="w-[236px] sm:w-[262px]">
        <div className="overflow-hidden rounded-[2.6rem] border border-white/12 bg-[#0a0f1a] p-[7px] shadow-[0_32px_90px_-30px_rgba(31,127,115,0.35)]">
          <div className="relative flex h-[430px] flex-col overflow-hidden rounded-[2.1rem] bg-[linear-gradient(180deg,#0a1524_0%,#060b14_100%)] sm:h-[460px]">
            <div
              aria-hidden
              className="absolute left-1/2 top-1.5 z-10 h-[18px] w-[74px] -translate-x-1/2 rounded-full border border-white/[0.05] bg-black/95"
            />

            {/* Header de la app */}
            <div className="flex items-end justify-between px-4 pb-2.5 pt-8">
              <div>
                <p className="text-[15px] font-semibold tracking-tight text-white">{copy.appName}</p>
                <p className="mt-0.5 text-[10px] text-white/45">{copy.today}</p>
              </div>
              <span
                aria-hidden
                className="inline-flex size-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3dddc4,#1f7f73)] text-[10px] font-semibold text-slate-950"
              >
                LS
              </span>
            </div>

            {/* Pantallas con slide */}
            <div className="relative flex-1 overflow-hidden border-t border-white/[0.06]">
              {/* Sin mode: los panels son absolute inset-0, entran/salen superpuestos */}
              <AnimatePresence initial={false} custom={direction}>
                <motion.div
                  key={tab}
                  role="tabpanel"
                  id={`micro-demo-panel-${tab}`}
                  aria-labelledby={`micro-demo-tab-${tab}`}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  className="absolute inset-0 overflow-y-auto px-3 py-3 [scrollbar-width:none]"
                >
                  {tab === 'agenda' ? (
                    <div className="space-y-2">
                      {APPOINTMENTS.map((appointment, index) => (
                        <button
                          key={appointment.name}
                          type="button"
                          onClick={() => cycleStatus(index)}
                          className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.06] active:scale-[0.98]"
                        >
                          <span className="shrink-0 font-mono text-[10px] text-white/55">
                            {appointment.time}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-[11px] font-medium text-white/90">
                              {appointment.name}
                            </span>
                            <span className="block truncate text-[9px] text-white/40">
                              {appointment.service[locale]}
                            </span>
                          </span>
                          <span
                            className={cn(
                              'shrink-0 rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] transition-colors',
                              STATUS_STYLES[statuses[index]],
                            )}
                          >
                            {STATUS_LABELS[statuses[index]][locale]}
                          </span>
                        </button>
                      ))}
                      <p className="pt-1 text-center text-[9px] leading-4 text-white/35">
                        {copy.agendaHint}
                      </p>
                    </div>
                  ) : null}

                  {tab === 'nuevo' ? (
                    step === 'servicio' ? (
                      <div className="space-y-2">
                        <p className="px-0.5 text-[11px] font-medium text-white/75">{copy.pickService}</p>
                        {SERVICES.map((service, index) => {
                          const Icon = service.icon
                          return (
                            <button
                              key={service.name.en}
                              type="button"
                              onClick={() => {
                                setServiceIndex(index)
                                setStep('horario')
                              }}
                              className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5 text-left transition hover:border-[rgba(61,221,196,0.35)] hover:bg-[rgba(61,221,196,0.06)] active:scale-[0.98]"
                            >
                              <span
                                aria-hidden
                                className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg bg-[rgba(61,221,196,0.12)] text-[#3dddc4]"
                              >
                                <Icon size={13} strokeWidth={2.2} />
                              </span>
                              <span className="flex-1 text-[11px] font-medium text-white/90">
                                {service.name[locale]}
                              </span>
                              <span className="shrink-0 font-mono text-[9px] text-white/40">
                                {service.duration}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    ) : step === 'horario' ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between px-0.5">
                          <p className="text-[11px] font-medium text-white/75">{copy.pickTime}</p>
                          <button
                            type="button"
                            onClick={() => setStep('servicio')}
                            className="text-[9px] text-white/40 transition hover:text-white/70"
                          >
                            {copy.back}
                          </button>
                        </div>
                        <p className="px-0.5 text-[9px] text-white/40">
                          {SERVICES[serviceIndex].name[locale]} · {SERVICES[serviceIndex].duration}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {TIME_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => {
                                setTime(slot)
                                setStep('listo')
                              }}
                              className="rounded-xl border border-[rgba(61,221,196,0.2)] bg-[rgba(61,221,196,0.05)] py-2.5 font-mono text-[11px] text-[#a5f0e0] transition hover:border-[rgba(61,221,196,0.5)] hover:bg-[rgba(61,221,196,0.12)] active:scale-[0.96]"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2.5 text-center">
                        <motion.span
                          initial={reduceMotion ? { opacity: 0 } : { scale: 0, opacity: 0 }}
                          animate={reduceMotion ? { opacity: 1 } : { scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 320, damping: 16 }}
                          className="inline-flex size-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3dddc4,#1f7f73)] text-slate-950 shadow-[0_0_36px_rgba(61,221,196,0.4)]"
                        >
                          <Check size={22} strokeWidth={2.6} aria-hidden />
                        </motion.span>
                        <p className="text-[12px] font-semibold text-white">{copy.confirmed}</p>
                        <p className="font-mono text-[10px] text-white/50">
                          {SERVICES[serviceIndex].name[locale]} · {time}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStep('servicio')}
                          className="mt-1 rounded-full border border-[rgba(61,221,196,0.28)] bg-[rgba(61,221,196,0.08)] px-4 py-1.5 text-[10px] font-medium text-[#8ceada] transition hover:border-[rgba(61,221,196,0.5)] hover:bg-[rgba(61,221,196,0.14)] active:scale-[0.97]"
                        >
                          {copy.another}
                        </button>
                      </div>
                    )
                  ) : null}

                  {tab === 'perfil' ? (
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] p-3">
                        <span
                          aria-hidden
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3dddc4,#1f7f73)] text-[11px] font-semibold text-slate-950"
                        >
                          LS
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] font-semibold text-white">
                            {copy.profileName}
                          </span>
                          <span className="block truncate text-[9px] text-white/45">{copy.profileRole}</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {copy.stats.map((stat) => (
                          <div
                            key={stat.label}
                            className="rounded-xl border border-white/[0.07] bg-white/[0.04] p-2 text-center"
                          >
                            <p className="text-[13px] font-semibold text-[#3dddc4]">{stat.value}</p>
                            <p className="mt-0.5 text-[8px] leading-3 text-white/45">{stat.label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl border border-[rgba(61,221,196,0.22)] bg-[rgba(61,221,196,0.07)] p-3">
                        <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-[#8ceada]/80">
                          {copy.nextAppt}
                        </p>
                        <p className="mt-1 text-[11px] font-medium text-white/90">
                          {APPOINTMENTS[0].time} · {APPOINTMENTS[0].name}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Tab bar */}
            <div
              role="tablist"
              aria-label={copy.tablistLabel}
              className="flex border-t border-white/[0.08] bg-white/[0.03]"
            >
              {TAB_ORDER.map((tabId) => {
                const Icon = TABS[tabId].icon
                const selected = tab === tabId
                return (
                  <button
                    key={tabId}
                    type="button"
                    role="tab"
                    id={`micro-demo-tab-${tabId}`}
                    aria-selected={selected}
                    aria-controls={selected ? `micro-demo-panel-${tabId}` : undefined}
                    onClick={() => selectTab(tabId)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-0.5 pb-3 pt-2.5 transition',
                      selected ? 'text-[#3dddc4]' : 'text-white/35 hover:text-white/60',
                    )}
                  >
                    <Icon size={16} strokeWidth={2.1} aria-hidden />
                    <span className="text-[9px] font-medium">{TABS[tabId].label[locale]}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <p className="max-w-xs text-center text-xs leading-5 text-white/45">{copy.hint}</p>
    </div>
  )
}
