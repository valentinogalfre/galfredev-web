'use client'

import { BorderGlowCard } from '@/components/motion/border-glow-card'
import { StaggerItem, StaggerReveal } from '@/components/motion/stagger-reveal'
import { calculateRoi } from '@/lib/roi'
import { formatCurrencyArs } from '@/lib/utils'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { RoiCalculatorLabels } from '@/types/content'
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { ArrowRight, Coins, TrendingUp, Wallet } from 'lucide-react'
import { useEffect, useId, useMemo, useState, type ComponentType } from 'react'

const DEFAULT_SALARY_ARS = 850000
const DEFAULT_HOURS = 16

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

function AnimatedMetric({
  value,
  formatter,
}: {
  value: number
  formatter: (value: number) => string
}) {
  const reducedMotion = useReducedMotion()
  const motionValue = useMotionValue(value)
  const spring = useSpring(motionValue, {
    stiffness: 110,
    damping: 22,
    mass: 0.8,
  })
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    motionValue.set(value)
  }, [motionValue, value])

  useMotionValueEvent(spring, 'change', (latest) => {
    setDisplayValue(latest)
  })

  if (reducedMotion) {
    return <>{formatter(value)}</>
  }

  return <>{formatter(displayValue)}</>
}

function RoiProjectionChart({
  monthlySavingsArs,
  labels,
}: {
  monthlySavingsArs: number
  labels: RoiCalculatorLabels['chart']
}) {
  const data = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        month: index + 1,
        value: monthlySavingsArs * (index + 1),
      })),
    [monthlySavingsArs],
  )

  const width = 760
  const height = 260
  const paddingX = 26
  const paddingTop = 20
  const paddingBottom = 32
  const chartWidth = width - paddingX * 2
  const chartHeight = height - paddingTop - paddingBottom
  const maxValue = Math.max(...data.map((point) => point.value), 1)

  const points = data.map((point, index) => {
    const x = paddingX + (chartWidth / (data.length - 1)) * index
    const y =
      paddingTop + chartHeight - (point.value / maxValue) * chartHeight

    return { ...point, x, y }
  })

  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath = `${linePath} L ${points.at(-1)?.x ?? width - paddingX} ${
    height - paddingBottom
  } L ${points[0]?.x ?? paddingX} ${height - paddingBottom} Z`

  return (
    <div className="surface-panel surface-panel-soft p-4 sm:p-5">
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
          <linearGradient id="roi-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(31,127,115,0.6)" />
            <stop offset="100%" stopColor="rgba(61,221,196,1)" />
          </linearGradient>
          <linearGradient id="roi-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(31,127,115,0.28)" />
            <stop offset="100%" stopColor="rgba(31,127,115,0)" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = paddingTop + chartHeight - chartHeight * ratio

          return (
            <line
              key={ratio}
              x1={paddingX}
              x2={width - paddingX}
              y1={y}
              y2={y}
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="6 8"
            />
          )
        })}

        <path
          d={areaPath}
          fill="url(#roi-fill)"
          opacity="1"
        />
        <path
          d={linePath}
          fill="none"
          stroke="url(#roi-line)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="1"
        />

        {points.map((point) => (
          <g key={point.month}>
            <circle
              cx={point.x}
              cy={point.y}
              r="5"
              fill="#0a0a0f"
              stroke="rgba(61,221,196,0.9)"
              strokeWidth="3"
            />
          </g>
        ))}

        {points.map((point) => (
          <text
            key={`label-${point.month}`}
            x={point.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-white/45 text-[11px]"
          >
            {point.month}
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
}

function ResultCard({ label, value, formatter, icon: Icon }: ResultCardProps) {
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
        <p className="mt-auto overflow-hidden break-words pt-3 text-[1.15rem] font-medium leading-[1] tracking-[-0.04em] text-white sm:pt-4 sm:text-[1.6rem]">
          <AnimatedMetric value={value} formatter={formatter} />
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
            <div className="space-y-5">
              <div>
                <label
                  htmlFor={salaryInputId}
                  className="flex items-center gap-2 text-sm font-medium text-white"
                >
                  <Wallet size={16} className="text-[var(--color-accent)]" />
                  {labels.salary.label}
                </label>
                <p className="mt-2 text-sm leading-6 text-white/55">
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
                  <span className="rounded-full border border-[var(--color-accent)]/18 bg-[var(--color-accent)]/10 px-3 py-1 text-sm font-medium text-[var(--color-accent)]">
                    {formatHours(repetitiveHoursPerWeek)} {labels.hours.unit}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/55">
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
                    className="roi-slider h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
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
          <RoiProjectionChart
            monthlySavingsArs={results.monthlySavingsArs}
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
          />
        </StaggerItem>
      </StaggerReveal>
    </div>
  )
}
