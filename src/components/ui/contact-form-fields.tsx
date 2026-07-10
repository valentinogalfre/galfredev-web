'use client'

import {
  AnimatePresence,
  animate,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

// text-base (16px): por debajo de 16px iOS Safari hace auto-zoom al enfocar
// el campo — en el form de conversión principal eso es un salto de layout.
// El padding asimétrico (más arriba) deja lugar al label flotante interno.
const controlClassName =
  'field-focus-quiet w-full rounded-[22px] border bg-[rgba(255,255,255,0.045)] px-4 pt-[1.45rem] pb-[0.55rem] text-base text-white outline-none transition-colors duration-300 placeholder:text-white/26 focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-70'

function borderClassName(error?: string) {
  return error
    ? 'border-rose-400/55'
    : 'border-white/10 focus:border-[rgba(61,221,196,0.55)]'
}

/**
 * Anillo que «se dibuja» alrededor del campo al enfocarlo: un conic-gradient
 * teal barre los 360° enmascarado al borde (técnica padding-box XOR). Con
 * reduced-motion no se renderiza: queda el cambio de color de borde nativo.
 */
function FieldRing({ focused }: { focused: boolean }) {
  const reducedMotion = useReducedMotion()
  const sweep = useMotionValue(0)
  const opacity = useMotionValue(0)
  const background = useMotionTemplate`conic-gradient(from -90deg, rgba(61,221,196,0.95) 0deg, rgba(61,221,196,0.8) ${sweep}deg, rgba(61,221,196,0) ${sweep}deg)`

  useEffect(() => {
    if (reducedMotion) return

    if (focused) {
      sweep.jump(0)
      const sweepControls = animate(sweep, 360, {
        duration: 0.55,
        ease: [0.3, 0.5, 0.3, 1],
      })
      const opacityControls = animate(opacity, 1, { duration: 0.12 })

      return () => {
        sweepControls.stop()
        opacityControls.stop()
      }
    }

    const controls = animate(opacity, 0, { duration: 0.3, ease: 'easeOut' })
    return () => controls.stop()
  }, [focused, reducedMotion, sweep, opacity])

  if (reducedMotion) return null

  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 rounded-[22px]"
      style={{
        background,
        opacity,
        padding: 1.5,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        maskComposite: 'exclude',
      }}
    />
  )
}

type FloatingLabelProps = {
  label: string
  floated: boolean
  focused: boolean
  error?: boolean
  htmlFor?: string
  id?: string
  /** top (px) del label en reposo — centrado en inputs, arriba en textarea. */
  restTop: number
}

/**
 * Label flotante: en reposo ocupa el lugar del placeholder; al enfocar o con
 * valor sube y se achica con un tween corto. Sigue siendo un <label htmlFor>
 * real (o <span id> para el listbox), así que la accesibilidad no cambia.
 */
function FloatingLabel({
  label,
  floated,
  focused,
  error,
  htmlFor,
  id,
  restTop,
}: FloatingLabelProps) {
  const reducedMotion = useReducedMotion()
  const Tag = htmlFor ? motion.label : motion.span

  return (
    <Tag
      htmlFor={htmlFor}
      id={id}
      initial={false}
      animate={{
        top: floated ? 8 : restTop,
        fontSize: floated ? '10.5px' : '16px',
        letterSpacing: floated ? '0.12em' : '0em',
        color: error
          ? 'rgba(253,164,175,0.92)'
          : floated
            ? focused
              ? 'rgba(61,221,196,0.95)'
              : 'rgba(255,255,255,0.58)'
            : 'rgba(255,255,255,0.46)',
      }}
      transition={
        reducedMotion ? { duration: 0 } : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
      }
      className="pointer-events-none absolute left-4 z-10 origin-left font-medium leading-none"
    >
      {label}
    </Tag>
  )
}

/** Helper/error bajo el campo: el error entra y sale animado. */
function FieldNote({ error, helper }: { error?: string; helper?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <AnimatePresence initial={false} mode="wait">
      {error ? (
        <motion.p
          key={`error-${error}`}
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="px-1 text-[13px] leading-5 text-rose-200"
        >
          {error}
        </motion.p>
      ) : helper ? (
        <p key="helper" className="px-1 text-[13px] leading-5 text-white/40">
          {helper}
        </p>
      ) : null}
    </AnimatePresence>
  )
}

function FieldWrap({
  children,
  error,
  helper,
}: {
  children: ReactNode
  error?: string
  helper?: string
}) {
  return (
    <div className="grid content-start gap-1.5 text-sm text-white/72">
      {children}
      <FieldNote error={error} helper={helper} />
    </div>
  )
}

type TextInputFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'children'
> & {
  label: string
  error?: string
  helper?: string
}

export function TextInputField({
  label,
  error,
  helper,
  className,
  id,
  placeholder,
  onFocus,
  onBlur,
  ...props
}: TextInputFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [focused, setFocused] = useState(false)
  const hasValue = props.value != null && String(props.value).length > 0
  const floated = focused || hasValue

  return (
    <FieldWrap error={error} helper={helper}>
      <div className="relative">
        <input
          {...props}
          id={fieldId}
          placeholder={focused ? placeholder : undefined}
          aria-invalid={Boolean(error)}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          className={[controlClassName, borderClassName(error), className]
            .filter(Boolean)
            .join(' ')}
        />
        <FloatingLabel
          htmlFor={fieldId}
          label={label}
          floated={floated}
          focused={focused}
          error={Boolean(error)}
          restTop={20}
        />
        <FieldRing focused={focused} />
      </div>
    </FieldWrap>
  )
}

type TextAreaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'children'
> & {
  label: string
  error?: string
  helper?: string
}

export function TextAreaField({
  label,
  error,
  helper,
  className,
  id,
  placeholder,
  onFocus,
  onBlur,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [focused, setFocused] = useState(false)
  const hasValue = props.value != null && String(props.value).length > 0
  const floated = focused || hasValue

  return (
    <FieldWrap error={error} helper={helper}>
      <div className="relative">
        <textarea
          {...props}
          id={fieldId}
          placeholder={focused ? placeholder : undefined}
          aria-invalid={Boolean(error)}
          onFocus={(event) => {
            setFocused(true)
            onFocus?.(event)
          }}
          onBlur={(event) => {
            setFocused(false)
            onBlur?.(event)
          }}
          className={[
            controlClassName,
            borderClassName(error),
            'min-h-[144px] resize-y rounded-[24px] pt-[1.7rem]',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
        />
        <FloatingLabel
          htmlFor={fieldId}
          label={label}
          floated={floated}
          focused={focused}
          error={Boolean(error)}
          restTop={19}
        />
        <FieldRing focused={focused} />
      </div>
    </FieldWrap>
  )
}

type SelectOption = {
  value: string
  label: string
}

type SelectFieldProps = {
  label: string
  value: string
  options: readonly SelectOption[]
  placeholder: string
  error?: string
  helper?: string
  disabled?: boolean
  onChange: (value: string) => void
}

export function SelectField({
  label,
  value,
  options,
  placeholder,
  error,
  helper,
  disabled,
  onChange,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const reducedMotion = useReducedMotion()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonId = useId()
  const listboxId = useId()
  const labelId = useId()

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const selectedOption = options.find((option) => option.value === value)
  const floated = open || focused || Boolean(selectedOption)

  return (
    <FieldWrap error={error} helper={helper}>
      <div ref={wrapperRef} className="relative">
        <button
          id={buttonId}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${buttonId}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            controlClassName,
            borderClassName(error),
            'flex min-h-[56px] items-center justify-between text-left',
            open ? 'border-[rgba(61,221,196,0.55)] bg-white/[0.07]' : '',
          ].join(' ')}
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current)
            }
          }}
        >
          <span className={selectedOption ? 'truncate' : 'truncate text-white/42'}>
            {selectedOption?.label ?? (floated ? placeholder : '')}
          </span>
          <ChevronDown
            size={18}
            className={[
              'shrink-0 text-white/48 transition',
              open ? 'rotate-180 text-[var(--color-accent)]' : '',
            ].join(' ')}
          />
        </button>
        <FloatingLabel
          id={labelId}
          label={label}
          floated={floated}
          focused={focused || open}
          error={Boolean(error)}
          restTop={20}
        />
        <FieldRing focused={focused || open} />

        <AnimatePresence>
          {open ? (
            <motion.div
              id={listboxId}
              role="listbox"
              aria-labelledby={labelId}
              initial={
                reducedMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 30 }}
              className="absolute left-0 right-0 z-20 mt-2 origin-top overflow-hidden rounded-[24px] border border-white/12 bg-[#0f1520] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            >
              <button
                type="button"
                role="option"
                aria-selected={!selectedOption}
                className="flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-sm text-white/52 transition hover:bg-white/[0.05] hover:text-white"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                <span>{placeholder}</span>
              </button>

              {options.map((option) => {
                const active = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    className={[
                      'mt-1 flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-left text-sm transition',
                      active
                        ? 'bg-[var(--color-accent)]/14 text-white'
                        : 'text-white/72 hover:bg-white/[0.05] hover:text-white',
                    ].join(' ')}
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                  >
                    <span>{option.label}</span>
                    {active ? (
                      <CheckDraw checked className="size-4 text-[var(--color-accent)]" />
                    ) : null}
                  </button>
                )
              })}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </FieldWrap>
  )
}

/** Tilde SVG que se dibuja (pathLength) al pasar a checked. */
function CheckDraw({ checked, className }: { checked: boolean; className?: string }) {
  const reducedMotion = useReducedMotion()

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <motion.path
        d="M4.5 12.5l5 5L19.5 7"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
        transition={reducedMotion ? { duration: 0 } : { duration: 0.26, ease: 'easeOut' }}
      />
    </svg>
  )
}

type ConsentCheckboxCardProps = {
  label: string
  checked: boolean
  required?: boolean
  disabled?: boolean
  error?: string
  onChange: (checked: boolean) => void
}

export function ConsentCheckboxCard({
  label,
  checked,
  required,
  disabled,
  error,
  onChange,
}: ConsentCheckboxCardProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'flex w-full items-start gap-3 rounded-[20px] border px-4 py-3 text-left transition',
          checked
            ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/12'
            : 'border-white/8 bg-white/[0.02] hover:border-white/16 hover:bg-white/[0.04]',
          disabled ? 'cursor-not-allowed opacity-70' : '',
        ].join(' ')}
      >
        <motion.span
          initial={false}
          animate={reducedMotion ? { scale: 1 } : { scale: checked ? [1, 1.18, 1] : 1 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className={[
            'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition',
            checked
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-slate-950 shadow-[0_0_0_4px_rgba(31,127,115,0.14)]'
              : 'border-white/18 bg-transparent text-transparent',
          ].join(' ')}
        >
          <CheckDraw checked={checked} className="size-3.5" />
        </motion.span>
        <span className="text-sm leading-6 text-white/72">
          {label}
          {required ? ' *' : ''}
        </span>
      </button>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  )
}
