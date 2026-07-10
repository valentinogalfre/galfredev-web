'use client'

import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import {
  BarChart3,
  ClipboardList,
  Database,
  MessageCircle,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { Fragment, useEffect, useRef, useState } from 'react'

/** Un paquete de datos en vuelo: vive en el conector `segment` (0..3). */
type Packet = { id: number; segment: number }

const NODE_COUNT = 5
/** Duración de cada salto nodo→nodo del paquete. */
const HOP_MS = 620
/** Con reduced-motion no hay dot viajando: la secuencia se acelera. */
const HOP_MS_REDUCED = 220
/** Cuánto queda "encendido" un nodo tras recibir un paquete. */
const LIT_MS = 750
/** Vida del microresultado contextual de cada nodo. */
const MSG_MS = 2100

const NODES: { icon: LucideIcon; label: Record<Locale, string> }[] = [
  { icon: ClipboardList, label: { es: 'Formulario', en: 'Form' } },
  { icon: Sparkles, label: { es: 'IA clasifica', en: 'AI classifies' } },
  { icon: Database, label: { es: 'CRM', en: 'CRM' } },
  { icon: MessageCircle, label: { es: 'WhatsApp', en: 'WhatsApp' } },
  { icon: BarChart3, label: { es: 'Métricas', en: 'Metrics' } },
]

/**
 * Microresultados por nodo: rotan entre variantes en cada llegada para que
 * spamear el botón se sienta vivo (nunca dos veces seguidas lo mismo).
 */
const RESULTS: Record<Locale, string[]>[] = [
  {
    es: ['lead: María · plan Pro', 'lead: Julián · consulta', 'lead: Carla · demo'],
    en: ['lead: María · Pro plan', 'lead: Julián · inquiry', 'lead: Carla · demo'],
  },
  {
    es: ['clasificado: prioridad alta', 'clasificado: quiere comprar', 'clasificado: pide presupuesto'],
    en: ['classified: high priority', 'classified: ready to buy', 'classified: wants a quote'],
  },
  {
    es: ['cargado en CRM · #4821', 'etiquetado · #4822', 'pipeline al día · #4823'],
    en: ['loaded in CRM · #4821', 'tagged · #4822', 'pipeline synced · #4823'],
  },
  {
    es: ['respuesta enviada en 3 s', 'seguimiento programado', 'recordatorio agendado'],
    en: ['reply sent in 3 s', 'follow-up scheduled', 'reminder set'],
  },
  {
    es: ['dashboard actualizado', '+1 lead esta semana', 'conversión recalculada'],
    en: ['dashboard updated', '+1 lead this week', 'conversion recalculated'],
  },
]

const COPY = {
  es: {
    fire: 'Disparar automatización',
    processed: 'Procesados',
    flowLabel: 'Flujo de automatización: formulario, IA, CRM, WhatsApp, métricas',
    hint: 'Tocá el botón todas las veces que quieras: cada disparo recorre el flujo entero, incluso varios a la vez.',
  },
  en: {
    fire: 'Trigger automation',
    processed: 'Processed',
    flowLabel: 'Automation flow: form, AI, CRM, WhatsApp, metrics',
    hint: 'Tap the button as many times as you want: every trigger runs the whole flow, even several at once.',
  },
} as const

/**
 * Pipeline de automatización disparable: 5 nodos (Formulario → IA → CRM →
 * WhatsApp → Métricas) por los que viaja un paquete de datos animado. Cada
 * nodo se enciende al recibirlo y muestra un microresultado efímero; al
 * llegar a Métricas suma al contador. Spammeable: cada click dispara un
 * paquete propio con su cadena de timeouts, sin compartir estado de vuelo.
 * Sin red: todo local. Mobile: columna vertical; desktop: fila horizontal
 * (los conectores cambian de eje solo con CSS responsive).
 */
export function Pipeline({ locale }: { locale: Locale }) {
  const copy = COPY[locale]
  const reduceMotion = useReducedMotion()

  const [packets, setPackets] = useState<Packet[]>([])
  const [lit, setLit] = useState<boolean[]>(() => Array(NODE_COUNT).fill(false))
  const [pulses, setPulses] = useState<number[]>(() => Array(NODE_COUNT).fill(0))
  const [messages, setMessages] = useState<(string | null)[]>(() => Array(NODE_COUNT).fill(null))
  const [processed, setProcessed] = useState(0)

  const packetId = useRef(0)
  const pulseCount = useRef<number[]>(Array(NODE_COUNT).fill(0))
  const timeouts = useRef<Set<ReturnType<typeof setTimeout>>>(new Set())
  const litTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(Array(NODE_COUNT).fill(null))
  const msgTimers = useRef<(ReturnType<typeof setTimeout> | null)[]>(Array(NODE_COUNT).fill(null))

  // Limpieza total al desmontar: ningún timeout sobrevive a la demo.
  useEffect(() => {
    const pending = timeouts.current
    return () => pending.forEach(clearTimeout)
  }, [])

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(() => {
      timeouts.current.delete(id)
      fn()
    }, ms)
    timeouts.current.add(id)
    return id
  }

  const cancel = (id: ReturnType<typeof setTimeout> | null) => {
    if (id === null) return
    clearTimeout(id)
    timeouts.current.delete(id)
  }

  /** Un paquete llega al nodo `node`: glow + microresultado + contador. */
  const arriveAt = (node: number) => {
    pulseCount.current[node] += 1
    const pulse = pulseCount.current[node]
    const variants = RESULTS[node][locale]

    setPulses((current) => current.map((value, i) => (i === node ? pulse : value)))
    setMessages((current) =>
      current.map((value, i) => (i === node ? variants[(pulse - 1) % variants.length] : value)),
    )
    setLit((current) => (current[node] ? current : current.map((value, i) => (i === node ? true : value))))

    cancel(litTimers.current[node])
    litTimers.current[node] = schedule(() => {
      setLit((current) => current.map((value, i) => (i === node ? false : value)))
    }, LIT_MS)

    cancel(msgTimers.current[node])
    msgTimers.current[node] = schedule(() => {
      setMessages((current) => current.map((value, i) => (i === node ? null : value)))
    }, MSG_MS)

    if (node === NODE_COUNT - 1) setProcessed((count) => count + 1)
  }

  const fire = () => {
    const hop = reduceMotion ? HOP_MS_REDUCED : HOP_MS
    const id = packetId.current++

    arriveAt(0)
    if (!reduceMotion) setPackets((current) => [...current, { id, segment: 0 }])

    for (let node = 1; node < NODE_COUNT; node++) {
      schedule(() => {
        arriveAt(node)
        if (reduceMotion) return
        setPackets((current) =>
          node === NODE_COUNT - 1
            ? current.filter((packet) => packet.id !== id)
            : current.map((packet) => (packet.id === id ? { ...packet, segment: node } : packet)),
        )
      }, node * hop)
    }
  }

  return (
    <div data-testid="micro-demo" className="relative px-4 py-6 sm:px-6 sm:py-7">
      {/* Toolbar: disparar + contador acumulado */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={fire}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_10px_32px_rgba(31,127,115,0.32)] transition hover:brightness-110 active:scale-[0.985]"
        >
          <Zap size={15} strokeWidth={2.4} aria-hidden />
          {copy.fire}
        </button>

        <span
          aria-live="polite"
          className="font-mono text-[11px] tracking-[0.08em] text-white/50"
        >
          {copy.processed}:{' '}
          <motion.span
            key={processed}
            initial={processed === 0 || reduceMotion ? false : { scale: 1.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            className="inline-block font-semibold text-[#3dddc4]"
          >
            {processed}
          </motion.span>
        </span>
      </div>

      {/* Flujo: columna en mobile, fila en desktop */}
      <div
        aria-label={copy.flowLabel}
        className="mt-5 flex flex-col sm:mt-7 sm:flex-row sm:items-start"
      >
        {NODES.map((node, index) => {
          const Icon = node.icon
          const isLit = lit[index]
          const pulse = pulses[index]
          const message = messages[index]

          return (
            <Fragment key={node.label.en}>
              {index > 0 ? (
                /* Conector: vertical en mobile, horizontal en desktop. El
                   track es la línea de 1px; los dots animan left Y top 0→100%
                   a la vez — el eje "muerto" mide 1px, así que el mismo
                   markup sirve para ambas orientaciones. */
                <div
                  aria-hidden
                  className="relative h-6 w-11 shrink-0 self-start sm:h-11 sm:w-auto sm:flex-1 sm:self-auto"
                >
                  <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[rgba(61,221,196,0.25)] sm:left-0 sm:top-1/2 sm:h-px sm:w-full sm:-translate-x-0 sm:-translate-y-1/2">
                    {packets
                      .filter((packet) => packet.segment === index - 1)
                      .map((packet) => (
                        <motion.span
                          key={packet.id}
                          initial={{ left: '0%', top: '0%', opacity: 0 }}
                          animate={{ left: '100%', top: '100%', opacity: 1 }}
                          transition={{
                            duration: HOP_MS / 1000,
                            ease: 'linear',
                            opacity: { duration: 0.12 },
                          }}
                          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3dddc4] shadow-[0_0_14px_3px_rgba(61,221,196,0.65)]"
                        />
                      ))}
                  </div>
                </div>
              ) : null}

              {/* Nodo: fila (icono + textos) en mobile, columna en desktop */}
              <div className="flex w-full items-center gap-3 sm:w-[104px] sm:shrink-0 sm:flex-col sm:items-center sm:gap-2 sm:text-center">
                <motion.span
                  key={`tile-${index}-${pulse}`}
                  initial={pulse === 0 || reduceMotion ? false : { scale: 0.82 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 480, damping: 18 }}
                  className={cn(
                    'relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl border transition-colors duration-500',
                    isLit
                      ? 'border-[rgba(61,221,196,0.7)] bg-[rgba(61,221,196,0.16)] text-[#3dddc4] shadow-[0_0_26px_rgba(61,221,196,0.45)]'
                      : 'border-white/[0.09] bg-white/[0.04] text-white/55',
                  )}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden />
                  {/* Anillo ping al recibir: remonta con cada pulso */}
                  {pulse > 0 && !reduceMotion ? (
                    <motion.span
                      key={`ping-${pulse}`}
                      aria-hidden
                      initial={{ opacity: 0.7, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.65 }}
                      transition={{ duration: 0.7, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-xl border border-[#3dddc4]"
                    />
                  ) : null}
                </motion.span>

                <div className="min-w-0 flex-1 sm:flex-none">
                  <p
                    className={cn(
                      'text-xs font-medium transition-colors duration-500',
                      isLit ? 'text-white' : 'text-white/70',
                    )}
                  >
                    {node.label[locale]}
                  </p>
                  {/* Microresultado efímero: espacio reservado, sin saltos */}
                  <div className="h-4 sm:mt-0.5 sm:h-8" aria-live="polite">
                    <AnimatePresence mode="wait">
                      {message ? (
                        <motion.p
                          key={`${pulse}-${message}`}
                          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="truncate font-mono text-[9px] uppercase leading-4 tracking-[0.08em] text-[#8ceada] sm:line-clamp-2 sm:whitespace-normal"
                        >
                          {message}
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>

      <p className="mt-4 text-center text-xs leading-5 text-white/45 sm:mt-5">{copy.hint}</p>
    </div>
  )
}
