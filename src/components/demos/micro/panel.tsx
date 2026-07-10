'use client'

import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { animate, motion, useReducedMotion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type OrderStatus = 'pendiente' | 'en_curso' | 'completada'
type Order = {
  id: number
  client: string
  service: Record<Locale, string>
  amount: number
  status: OrderStatus
}

const STATUS_CYCLE: OrderStatus[] = ['pendiente', 'en_curso', 'completada']

const STATUS_STYLES: Record<OrderStatus, string> = {
  pendiente: 'border-amber-300/35 bg-amber-300/10 text-amber-200',
  en_curso: 'border-sky-300/35 bg-sky-300/10 text-sky-200',
  completada: 'border-[rgba(61,221,196,0.35)] bg-[rgba(61,221,196,0.12)] text-[#8ceada]',
}

const STATUS_LABELS: Record<OrderStatus, Record<Locale, string>> = {
  pendiente: { es: 'pendiente', en: 'pending' },
  en_curso: { es: 'en curso', en: 'in progress' },
  completada: { es: 'completada', en: 'completed' },
}

const SEED: Omit<Order, 'id'>[] = [
  {
    client: 'Ferretería Central',
    service: { es: 'Instalación', en: 'Installation' },
    amount: 145000,
    status: 'completada',
  },
  {
    client: 'Estudio Palma',
    service: { es: 'Soporte mensual', en: 'Monthly support' },
    amount: 80000,
    status: 'en_curso',
  },
  {
    client: 'Logística Sur',
    service: { es: 'Auditoría', en: 'Audit' },
    amount: 60000,
    status: 'pendiente',
  },
]

/** Pool de órdenes nuevas: «+ Nueva orden» las va sacando en ronda. */
const POOL: Omit<Order, 'id'>[] = [
  {
    client: 'Café Aroma',
    service: { es: 'Web + turnos', en: 'Web + bookings' },
    amount: 95000,
    status: 'pendiente',
  },
  {
    client: 'Clínica Andes',
    service: { es: 'Panel de gestión', en: 'Admin panel' },
    amount: 210000,
    status: 'pendiente',
  },
  {
    client: 'Gimnasio Pulse',
    service: { es: 'App de socios', en: 'Members app' },
    amount: 130000,
    status: 'pendiente',
  },
  {
    client: 'Vivero Norte',
    service: { es: 'Stock + ventas', en: 'Stock + sales' },
    amount: 75000,
    status: 'pendiente',
  },
  {
    client: 'Hotel Mirador',
    service: { es: 'Reservas', en: 'Bookings' },
    amount: 160000,
    status: 'pendiente',
  },
]

const COPY = {
  es: {
    heading: 'Órdenes de trabajo',
    newOrder: 'Nueva orden',
    total: 'Total facturado',
    pending: 'Pendientes',
    completed: 'Completadas',
    columns: { client: 'Cliente', service: 'Servicio', amount: 'Monto', status: 'Estado' },
    tableLabel: 'Órdenes de trabajo',
    editAmount: (client: string) => `Editar monto de ${client}`,
    cycleStatus: (client: string) => `Cambiar estado de ${client}`,
    hint: 'Tocá el estado para avanzarlo y el monto para editarlo: los stats reaccionan solos.',
    footer: 'Así se siente un sistema a medida: tus datos, tus reglas.',
  },
  en: {
    heading: 'Work orders',
    newOrder: 'New order',
    total: 'Total invoiced',
    pending: 'Pending',
    completed: 'Completed',
    columns: { client: 'Client', service: 'Service', amount: 'Amount', status: 'Status' },
    tableLabel: 'Work orders',
    editAmount: (client: string) => `Edit amount for ${client}`,
    cycleStatus: (client: string) => `Change status of ${client}`,
    hint: 'Tap a status to advance it and an amount to edit it: the stats react on their own.',
    footer: 'This is what custom software feels like: your data, your rules.',
  },
} as const

function formatMoney(value: number, locale: Locale) {
  return `$ ${value.toLocaleString(locale === 'es' ? 'es-AR' : 'en-US')}`
}

/**
 * Número que cuenta animado hacia el nuevo valor con cada cambio (los stats
 * «recalculan» en vivo). Con reduced-motion salta directo.
 */
function CountUp({ value, format }: { value: number; format: (value: number) => string }) {
  const reduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(value)
  const previous = useRef(value)

  useEffect(() => {
    if (previous.current === value) return
    const from = previous.current
    previous.current = value
    if (reduceMotion) return
    const controls = animate(from, value, {
      duration: 0.6,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    })
    return () => controls.stop()
  }, [value, reduceMotion])

  // Con reduced-motion el número salta directo al valor real, sin animar.
  return <>{format(reduceMotion ? value : display)}</>
}

/**
 * Mini panel de gestión vivo: tabla de órdenes de trabajo con stats arriba
 * que recalculan animados con cada cambio. Interacciones reales: agregar
 * órdenes (entran con spring desde un pool), ciclar el estado tocando el
 * badge y editar el monto inline (Enter confirma, Escape cancela). Sin red:
 * todos los datos son locales.
 */
export function Panel({ locale }: { locale: Locale }) {
  const copy = COPY[locale]
  const reduceMotion = useReducedMotion()

  const [orders, setOrders] = useState<Order[]>(() =>
    SEED.map((order, index) => ({ ...order, id: index })),
  )
  const [editingId, setEditingId] = useState<number | null>(null)
  const [draft, setDraft] = useState('')

  const nextId = useRef(SEED.length)
  const poolIndex = useRef(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const total = orders.reduce((sum, order) => sum + order.amount, 0)
  const pending = orders.filter((order) => order.status === 'pendiente').length
  const completed = orders.filter((order) => order.status === 'completada').length

  const addOrder = () => {
    const template = POOL[poolIndex.current % POOL.length]
    poolIndex.current += 1
    setOrders((current) => [...current, { ...template, id: nextId.current++ }])
  }

  // La orden nueva entra al final: acompañarla con scroll si la tabla creció.
  useEffect(() => {
    const node = scrollRef.current
    if (!node || orders.length <= SEED.length) return
    node.scrollTo({ top: node.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [orders.length, reduceMotion])

  const cycleStatus = (id: number) => {
    setOrders((current) =>
      current.map((order) =>
        order.id === id
          ? {
              ...order,
              status: STATUS_CYCLE[(STATUS_CYCLE.indexOf(order.status) + 1) % STATUS_CYCLE.length],
            }
          : order,
      ),
    )
  }

  const startEditing = (order: Order) => {
    setEditingId(order.id)
    setDraft(String(order.amount))
  }

  const commitEdit = () => {
    if (editingId === null) return
    const digits = draft.replace(/[^\d]/g, '')
    if (digits !== '') {
      // Cap defensivo: un monto absurdo no rompe el layout de la tabla.
      const parsed = Math.min(Number(digits), 99_999_999)
      setOrders((current) =>
        current.map((order) => (order.id === editingId ? { ...order, amount: parsed } : order)),
      )
    }
    setEditingId(null)
  }

  const stats = [
    { label: copy.total, value: total, format: (v: number) => formatMoney(v, locale), accent: true },
    { label: copy.pending, value: pending, format: String, accent: false },
    { label: copy.completed, value: completed, format: String, accent: false },
  ]

  return (
    <div data-testid="micro-demo" className="relative px-4 py-5 sm:px-6 sm:py-6">
      {/* Stats: recalculan animados con cada cambio de la tabla */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-white/[0.07] bg-white/[0.04] px-2.5 py-2.5 text-center sm:px-3 sm:py-3"
          >
            <p
              className={cn(
                'text-sm font-semibold tabular-nums sm:text-base',
                stat.accent ? 'text-[#3dddc4]' : 'text-white/90',
              )}
            >
              <CountUp value={stat.value} format={stat.format} />
            </p>
            <p className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/40 sm:text-[9px]">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Encabezado de la tabla + alta */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-tight text-white">{copy.heading}</p>
        <button
          type="button"
          onClick={addOrder}
          className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_8px_26px_rgba(31,127,115,0.32)] transition hover:brightness-110 active:scale-[0.97]"
        >
          <Plus size={13} strokeWidth={2.6} aria-hidden className="-ml-0.5" />
          {copy.newOrder}
        </button>
      </div>

      {/* Tabla de órdenes: semántica real (table/row/cell) */}
      <div
        ref={scrollRef}
        className="mt-2.5 max-h-[236px] overflow-y-auto rounded-xl border border-white/[0.07] [scrollbar-width:thin]"
      >
        <table aria-label={copy.tableLabel} className="w-full border-collapse text-left text-xs">
          <thead className="sticky top-0 z-10 bg-[#0c1626]">
            <tr className="border-b border-white/[0.08]">
              <th className="px-3 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white/40">
                {copy.columns.client}
              </th>
              <th className="hidden px-2 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white/40 sm:table-cell">
                {copy.columns.service}
              </th>
              <th className="px-2 py-2 font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white/40">
                {copy.columns.amount}
              </th>
              <th className="px-3 py-2 text-right font-mono text-[9px] font-medium uppercase tracking-[0.14em] text-white/40">
                {copy.columns.status}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <motion.tr
                key={order.id}
                initial={
                  order.id < SEED.length
                    ? false
                    : reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -12, scale: 0.97 }
                }
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 340, damping: 26 }}
                className="border-b border-white/[0.05] last:border-b-0"
              >
                <td className="max-w-[104px] truncate px-3 py-2.5 font-medium text-white/85 sm:max-w-none">
                  {order.client}
                </td>
                <td className="hidden px-2 py-2.5 text-white/45 sm:table-cell">
                  {order.service[locale]}
                </td>
                <td className="px-2 py-2.5">
                  {editingId === order.id ? (
                    <input
                      autoFocus
                      inputMode="numeric"
                      value={draft}
                      aria-label={copy.editAmount(order.client)}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') commitEdit()
                        if (event.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={commitEdit}
                      className="w-[76px] rounded-md border border-[rgba(61,221,196,0.5)] bg-[rgba(61,221,196,0.08)] px-1.5 py-1 font-mono text-[11px] text-white outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      aria-label={copy.editAmount(order.client)}
                      onClick={() => startEditing(order)}
                      className="whitespace-nowrap rounded-md px-1 py-0.5 font-mono text-[11px] tabular-nums text-white/80 underline decoration-dotted decoration-white/25 underline-offset-4 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      {formatMoney(order.amount, locale)}
                    </button>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right">
                  <button
                    type="button"
                    aria-label={copy.cycleStatus(order.client)}
                    onClick={() => cycleStatus(order.id)}
                    className={cn(
                      'rounded-full border px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.08em] transition-colors active:scale-[0.94] sm:text-[9px]',
                      STATUS_STYLES[order.status],
                    )}
                  >
                    {STATUS_LABELS[order.status][locale]}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-[10px] leading-4 text-white/35">{copy.hint}</p>
      <p className="mt-2 text-center text-xs font-medium leading-5 text-[#8ceada]/85">
        {copy.footer}
      </p>
    </div>
  )
}
