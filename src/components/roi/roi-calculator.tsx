'use client'

import { BorderGlowCard } from '@/components/motion/border-glow-card'
import { StaggerItem, StaggerReveal } from '@/components/motion/stagger-reveal'
import { calculateRoi } from '@/lib/roi'
import { formatCurrencyArs } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { RoiCalculatorLabels } from '@/types/content'
import {
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { ArrowRight, Coins, TrendingUp, Wallet } from 'lucide-react'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react'

const DEFAULT_SALARY_ARS = 850000
const DEFAULT_HOURS = 16

/** Rango del slider de sueldo (el input numérico admite valores fuera). */
const SALARY_SLIDER_MIN = 200_000
const SALARY_SLIDER_MAX = 5_000_000
const SALARY_SLIDER_STEP = 25_000

/**
 * Umbrales de celebración del ahorro anual: al cruzarlos hacia arriba el
 * contador «festeja» (pop + glow + partículas). Escalera 1-2-5 por década.
 */
const ANNUAL_CELEBRATION_THRESHOLDS = [
  1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8, 2e8, 5e8, 1e9,
] as const

function formatHours(value: number) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(value)
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('es-AR', {
    maximumFractionDigits: value < 10 ? 1 : 0,
  }).format(value)
}

function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? Number(digits) : 0
}

function formatCurrencyInput(value: number) {
  return formatCurrencyArs(Math.max(0, value))
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

/**
 * Sigue `target` con un spring y lo expone como estado renderizable.
 * Con reduced-motion devuelve el target directo (sin frames intermedios).
 */
function useSpringNumber(
  target: number,
  config: { stiffness: number; damping: number; mass?: number },
  reduced: boolean,
) {
  const motionValue = useMotionValue(target)
  const spring = useSpring(motionValue, config)
  const [value, setValue] = useState(target)

  useEffect(() => {
    motionValue.set(target)
  }, [motionValue, target])

  useMotionValueEvent(spring, 'change', (latest) => {
    setValue(latest)
  })

  return reduced ? target : value
}

function AnimatedMetric({
  value,
  formatter,
}: {
  value: number
  formatter: (value: number) => string
}) {
  const reducedMotion = useReducedMotion()
  const display = useSpringNumber(
    value,
    { stiffness: 110, damping: 22, mass: 0.8 },
    Boolean(reducedMotion),
  )

  return <>{formatter(display)}</>
}

/**
 * Incrementa un contador cada vez que `value` cruza hacia arriba alguno de
 * los umbrales. Sirve para re-montar (key) la animación de celebración.
 * Usa el patrón «adjust state during render» (sin effect).
 */
function useThresholdBurst(value: number, thresholds: readonly number[]) {
  const [state, setState] = useState({ value, burst: 0 })

  if (state.value !== value) {
    const crossed =
      value > state.value && thresholds.some((t) => state.value < t && value >= t)
    setState({ value, burst: crossed ? state.burst + 1 : state.burst })
  }

  return state.burst
}

/**
 * Estallido puntual: flash radial + anillo + partículas teal saliendo del
 * número. Se re-monta con `key` en cada burst; `seed` varía los ángulos.
 */
function CelebrationBurst({ seed }: { seed: number }) {
  const particles = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * Math.PI * 2 + seed * 0.9
    const distance = 30 + ((index * 37 + seed * 13) % 24)

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: (index % 4) * 0.02,
    }
  })

  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.85, 0] }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute -inset-2 rounded-2xl bg-[radial-gradient(circle,rgba(61,221,196,0.28),transparent_70%)]"
      />
      <motion.span
        initial={{ opacity: 0.7, scale: 0.55 }}
        animate={{ opacity: 0, scale: 1.5 }}
        transition={{ duration: 0.65, ease: 'easeOut' }}
        className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(61,221,196,0.8)]"
      />
      {particles.map((particle, index) => (
        <motion.span
          key={index}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: particle.x,
            y: particle.y,
            opacity: 0,
            scale: 0.35,
          }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: particle.delay }}
          className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-[#3dddc4] shadow-[0_0_10px_2px_rgba(61,221,196,0.55)]"
        />
      ))}
    </span>
  )
}

/**
 * Gráfico vivo: 12 barras de ahorro acumulado con doble spring (el valor
 * reacciona rápido, la escala lo persigue lento) → cada movimiento del input
 * produce una oleada orgánica. Marca el hito donde el acumulado supera un
 * sueldo mensual completo con línea punteada + pulso teal.
 */
function RoiLiveChart({
  monthlySavingsArs,
  monthlySalaryArs,
  labels,
}: {
  monthlySavingsArs: number
  monthlySalaryArs: number
  labels: RoiCalculatorLabels['chart']
}) {
  const reducedMotion = Boolean(useReducedMotion())
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, amount: 0.3 })
  const grown = inView || reducedMotion

  const totalArs = monthlySavingsArs * 12
  const milestoneMonth =
    monthlySavingsArs > 0
      ? Math.ceil(monthlySalaryArs / monthlySavingsArs)
      : Number.POSITIVE_INFINITY
  const hasMilestone =
    monthlySalaryArs > 0 && milestoneMonth >= 1 && milestoneMonth <= 12

  // La escala contempla la línea del sueldo solo si el hito entra en 12 meses.
  const targetMax =
    Math.max(hasMilestone ? Math.max(totalArs, monthlySalaryArs) : totalArs, 1) * 1.06

  // Doble spring: valor rápido / escala lenta y con leve rebote → oleada.
  const monthlyDisplay = useSpringNumber(
    grown ? monthlySavingsArs : 0,
    { stiffness: 170, damping: 26 },
    reducedMotion,
  )
  const maxDisplay = useSpringNumber(
    targetMax,
    { stiffness: 80, damping: 18 },
    reducedMotion,
  )

  const width = 760
  const height = 280
  const paddingX = 18
  const paddingTop = 34
  const paddingBottom = 30
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingTop - paddingBottom
  const columnWidth = chartWidth / 12
  const barWidth = columnWidth * 0.58
  const safeMax = Math.max(maxDisplay, 1)

  const bars = Array.from({ length: 12 }, (_, index) => {
    const value = monthlyDisplay * (index + 1)
    const barHeight = clamp((value / safeMax) * chartHeight, 0, chartHeight)

    return {
      month: index + 1,
      x: paddingX + columnWidth * index + (columnWidth - barWidth) / 2,
      y: paddingTop + chartHeight - barHeight,
      height: barHeight,
      reached: hasMilestone && index + 1 >= milestoneMonth,
    }
  })

  const salaryLineY =
    paddingTop +
    chartHeight -
    clamp((monthlySalaryArs / safeMax) * chartHeight, 0, chartHeight)
  const milestoneBar = hasMilestone ? bars[milestoneMonth - 1] : undefined
  const clipId = useId()

  return (
    <div ref={containerRef} className="surface-panel surface-panel-soft p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-white">{labels.title}</p>
          <p className="mt-1 text-[13px] leading-5 text-white/50">{labels.sub}</p>
        </div>
        <div className="hidden shrink-0 whitespace-nowrap rounded-full border border-[var(--color-accent)]/18 bg-[var(--color-accent)]/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--color-accent)] sm:inline-flex">
          {labels.badge}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-[220px] w-full"
        role="img"
        aria-label={labels.ariaLabel}
      >
        <defs>
          <linearGradient id="roi-bar-dim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(61,221,196,0.42)" />
            <stop offset="100%" stopColor="rgba(31,127,115,0.08)" />
          </linearGradient>
          <linearGradient id="roi-bar-hot" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(61,221,196,0.95)" />
            <stop offset="100%" stopColor="rgba(31,127,115,0.26)" />
          </linearGradient>
          <clipPath id={clipId}>
            <rect x={0} y={0} width={width} height={paddingTop + chartHeight} />
          </clipPath>
        </defs>

        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight - chartHeight * ratio

          return (
            <line
              key={ratio}
              x1={paddingX}
              x2={width - paddingX}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.07)"
              strokeDasharray="6 8"
            />
          )
        })}
        <line
          x1={paddingX}
          x2={width - paddingX}
          y1={paddingTop + chartHeight}
          y2={paddingTop + chartHeight}
          stroke="rgba(255,255,255,0.12)"
        />

        {/* Barras: la altura ya viene animada por los springs de arriba. El
            clip corta el redondeo inferior para que apoyen planas. */}
        <g clipPath={`url(#${clipId})`}>
          {bars.map((bar) => (
            <rect
              key={bar.month}
              x={bar.x}
              y={bar.y}
              width={barWidth}
              height={bar.height + 8}
              rx={Math.min(7, barWidth / 2.4)}
              fill={bar.reached ? 'url(#roi-bar-hot)' : 'url(#roi-bar-dim)'}
            />
          ))}
        </g>

        {/* Línea del hito: 1 sueldo mensual completo recuperado */}
        {hasMilestone ? (
          <g>
            <line
              x1={paddingX}
              x2={width - paddingX}
              y1={salaryLineY}
              y2={salaryLineY}
              stroke="rgba(61,221,196,0.55)"
              strokeWidth={1.5}
              strokeDasharray="7 7"
            />
            {milestoneBar ? (
              <g>
                {!reducedMotion ? (
                  <motion.circle
                    key={`ping-${milestoneMonth}`}
                    cx={milestoneBar.x + barWidth / 2}
                    cy={milestoneBar.y}
                    fill="none"
                    stroke="rgba(61,221,196,0.85)"
                    strokeWidth={2}
                    initial={{ r: 6, opacity: 0.85 }}
                    animate={{ r: 19, opacity: 0 }}
                    transition={{
                      duration: 1.5,
                      ease: 'easeOut',
                      repeat: Infinity,
                      repeatDelay: 0.8,
                    }}
                  />
                ) : null}
                <circle
                  cx={milestoneBar.x + barWidth / 2}
                  cy={milestoneBar.y}
                  r={6}
                  fill="#3dddc4"
                  stroke="rgba(10,14,20,0.9)"
                  strokeWidth={2}
                />
                {/* En mobile el viewBox escala ~0.4: tamaños responsive para
                    que el hito y los meses sigan siendo legibles. */}
                <text
                  x={clamp(milestoneBar.x + barWidth / 2, paddingX + 80, width - paddingX - 80)}
                  y={Math.max(milestoneBar.y - 14, 16)}
                  textAnchor="middle"
                  className="fill-[#8ceada] text-[20px] font-semibold sm:text-[13px]"
                  stroke="rgba(8,12,20,0.85)"
                  strokeWidth={3.5}
                  paintOrder="stroke"
                >
                  {labels.milestone}
                </text>
              </g>
            ) : null}
          </g>
        ) : null}

        {bars.map((bar) => (
          <text
            key={`label-${bar.month}`}
            x={bar.x + barWidth / 2}
            y={height - 8}
            textAnchor="middle"
            className={
              bar.month === milestoneMonth && hasMilestone
                ? 'fill-[#8ceada] text-[17px] font-semibold sm:text-[11px]'
                : 'fill-white/45 text-[17px] sm:text-[11px]'
            }
          >
            {bar.month}
          </text>
        ))}
      </svg>
    </div>
  )
}

type ResultCardProps = {
  label: string
  value: number
  formatter: (value: number) => string
  icon: ComponentType<{ size?: number; className?: string }>
  celebrationThresholds?: readonly number[]
}

function ResultCard({
  label,
  value,
  formatter,
  icon: Icon,
  celebrationThresholds,
}: ResultCardProps) {
  const reducedMotion = useReducedMotion()
  const burst = useThresholdBurst(value, celebrationThresholds ?? [])
  const celebrate = burst > 0 && !reducedMotion

  return (
    <BorderGlowCard className="relative h-full min-h-[7.5rem] p-3 sm:p-5">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2">
          <p className="text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.18em] text-white/55 sm:text-[11px] sm:tracking-[0.22em]">
            {label}
          </p>
          <div className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-[0.75rem] border border-[var(--color-accent)]/18 bg-[var(--color-accent)]/10 text-[var(--color-accent)] sm:h-8 sm:w-8 sm:rounded-[0.85rem]">
            <Icon size={12} className="sm:hidden" />
            <Icon size={14} className="hidden sm:block" />
          </div>
        </div>
        <p className="relative mt-auto break-words pt-3 text-[1.15rem] font-medium leading-[1] tracking-[-0.04em] text-white sm:pt-4 sm:text-[1.6rem]">
          {celebrate ? <CelebrationBurst key={burst} seed={burst} /> : null}
          <motion.span
            key={celebrate ? burst : 'metric'}
            initial={false}
            animate={
              celebrate
                ? {
                    scale: [1, 1.16, 1],
                    textShadow: [
                      '0 0 0px rgba(61,221,196,0)',
                      '0 0 24px rgba(61,221,196,0.85)',
                      '0 0 0px rgba(61,221,196,0)',
                    ],
                  }
                : { scale: 1 }
            }
            transition={{ duration: 0.55, ease: 'easeOut', times: [0, 0.35, 1] }}
            // block (no inline-block): permite el wrap del número en mobile
            className="relative block origin-left break-words"
          >
            <AnimatedMetric value={value} formatter={formatter} />
          </motion.span>
        </p>
      </div>
    </BorderGlowCard>
  )
}

/** Client component: UI de la calculadora. Todo el copy llega por props. */
export function ROICalculator({ labels }: { labels: RoiCalculatorLabels }) {
  const salaryInputId = useId()
  const hoursInputId = useId()
  const [monthlySalaryArs, setMonthlySalaryArs] = useState(DEFAULT_SALARY_ARS)
  const [repetitiveHoursPerWeek, setRepetitiveHoursPerWeek] = useState(DEFAULT_HOURS)

  const results = calculateRoi({
    monthlySalaryArs,
    repetitiveHoursPerWeek,
  })

  const salaryInputValue = formatCurrencyInput(monthlySalaryArs)
  const salarySliderValue = clamp(monthlySalaryArs, SALARY_SLIDER_MIN, SALARY_SLIDER_MAX)
  const salaryFillPct =
    ((salarySliderValue - SALARY_SLIDER_MIN) / (SALARY_SLIDER_MAX - SALARY_SLIDER_MIN)) * 100
  const hoursFillPct = ((repetitiveHoursPerWeek - 1) / (40 - 1)) * 100

  const whatsappHref = buildWhatsAppUrl(
    [
      labels.whatsapp.intro,
      `${labels.whatsapp.salary} ${formatCurrencyArs(monthlySalaryArs)}`,
      `${labels.whatsapp.hours} ${formatHours(repetitiveHoursPerWeek)} ${labels.hours.unit}`,
      `${labels.whatsapp.monthly} ${formatCurrencyArs(results.monthlySavingsArs)}`,
      `${labels.whatsapp.annual} ${formatCurrencyArs(results.annualSavingsArs)}`,
      labels.whatsapp.closing,
    ].join('\n'),
  )

  return (
    <div className="surface-panel mt-12 p-5 sm:p-7 lg:p-8">
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-5">
          <div className="surface-panel surface-panel-soft p-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor={salaryInputId}
                  className="flex items-center gap-2 text-sm font-medium text-white"
                >
                  <Wallet size={16} className="text-[var(--color-accent)]" />
                  {labels.salary.label}
                </label>
                <p id={`${salaryInputId}-help`} className="mt-2 text-sm leading-6 text-white/55">
                  {labels.salary.help}
                </p>
                <div className="mt-4 rounded-[1.3rem] border border-white/8 bg-white/[0.02] px-4 py-3 transition duration-300 focus-within:border-[var(--color-accent)]/45 focus-within:bg-white/[0.04]">
                  <input
                    id={salaryInputId}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={salaryInputValue}
                    onChange={(event) => {
                      setMonthlySalaryArs(parseCurrencyInput(event.target.value))
                    }}
                    className="w-full bg-transparent text-2xl font-medium tracking-[-0.04em] text-white outline-none placeholder:text-white/24"
                    aria-describedby={`${salaryInputId}-help`}
                  />
                </div>
                <div className="mt-4">
                  <input
                    type="range"
                    min={SALARY_SLIDER_MIN}
                    max={SALARY_SLIDER_MAX}
                    step={SALARY_SLIDER_STEP}
                    value={salarySliderValue}
                    onChange={(event) => {
                      setMonthlySalaryArs(Number(event.target.value))
                    }}
                    aria-label={labels.salary.label}
                    aria-describedby={`${salaryInputId}-help`}
                    className="roi-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent"
                    style={{ '--roi-fill': `${salaryFillPct}%` } as CSSProperties}
                  />
                  <div className="mt-2 flex justify-between text-xs text-white/34">
                    <span>{formatCurrencyArs(SALARY_SLIDER_MIN)}</span>
                    <span>{formatCurrencyArs(SALARY_SLIDER_MAX)}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-3">
                  <label
                    htmlFor={hoursInputId}
                    className="flex items-center gap-2 text-sm font-medium text-white"
                  >
                    <Coins size={16} className="text-[var(--color-accent)]" />
                    {labels.hours.label}
                  </label>
                  <span className="whitespace-nowrap rounded-full border border-[var(--color-accent)]/18 bg-[var(--color-accent)]/10 px-3 py-1 text-sm font-medium tabular-nums text-[var(--color-accent)]">
                    {formatHours(repetitiveHoursPerWeek)} {labels.hours.unit}
                  </span>
                </div>
                <p id={`${hoursInputId}-help`} className="mt-2 text-sm leading-6 text-white/55">
                  {labels.hours.help}
                </p>
                <div className="mt-5">
                  <input
                    id={hoursInputId}
                    type="range"
                    min={1}
                    max={40}
                    step={1}
                    value={repetitiveHoursPerWeek}
                    onChange={(event) => {
                      setRepetitiveHoursPerWeek(Number(event.target.value))
                    }}
                    className="roi-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent"
                    style={{ '--roi-fill': `${hoursFillPct}%` } as CSSProperties}
                    aria-describedby={`${hoursInputId}-help`}
                  />
                  <div className="mt-2 flex justify-between text-xs text-white/34">
                    <span>{labels.hours.min}</span>
                    <span>{labels.hours.max}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="ambient-divider" />

          <div className="rounded-[1.6rem] border border-[var(--color-accent)]/18 bg-[var(--color-accent)]/10 px-4 py-4 text-sm text-white/74">
            {labels.costNote.before}{' '}
            <span className="font-semibold text-white">
              <AnimatedMetric
                value={results.monthlyRepetitiveCostArs}
                formatter={formatCurrencyArs}
              />
            </span>{' '}
            {labels.costNote.after}
          </div>
        </div>

        <div className="space-y-4">
          <RoiLiveChart
            monthlySavingsArs={results.monthlySavingsArs}
            monthlySalaryArs={monthlySalaryArs}
            labels={labels.chart}
          />

          <motion.a
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="surface-panel-interactive group relative block overflow-hidden rounded-[1.6rem] border border-[var(--color-accent)]/20 bg-[linear-gradient(180deg,rgba(31,127,115,0.13),rgba(31,127,115,0.05))] p-5 text-white backdrop-blur-sm hover:border-[var(--color-accent)]/32 hover:shadow-[0_0_48px_rgba(31,127,115,0.12)]"
          >
            <div className="pointer-events-none absolute inset-[1px] rounded-[calc(1.6rem-1px)] border border-[var(--color-accent)]/8" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-accent)]">
              {labels.next.kicker}
            </p>
            <p className="mt-3 text-xl font-medium leading-tight tracking-[-0.04em]">
              {labels.next.before}{' '}
              <span className="text-[var(--color-accent)]">
                <AnimatedMetric
                  value={results.annualSavingsArs}
                  formatter={formatCurrencyArs}
                />
              </span>{' '}
              {labels.next.after}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white/84">
              {labels.next.cta}
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </div>
          </motion.a>
        </div>
      </div>

      <StaggerReveal className="mt-6 grid grid-cols-3 gap-3 sm:gap-4" delay={0.1} stagger={0.09}>
        <StaggerItem className="h-full">
          <ResultCard
            label={labels.results.monthly}
            value={results.monthlySavingsArs}
            formatter={formatCurrencyArs}
            icon={TrendingUp}
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <ResultCard
            label={labels.results.hoursFree}
            value={results.monthlyHoursRecovered}
            formatter={(value) => `${formatCompactNumber(value)} ${labels.hours.unit}`}
            icon={Coins}
          />
        </StaggerItem>
        <StaggerItem className="h-full">
          <ResultCard
            label={labels.results.annual}
            value={results.annualSavingsArs}
            formatter={formatCurrencyArs}
            icon={Wallet}
            celebrationThresholds={ANNUAL_CELEBRATION_THRESHOLDS}
          />
        </StaggerItem>
      </StaggerReveal>
    </div>
  )
}
