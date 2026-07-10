'use client'

import { Check, ChevronDown } from 'lucide-react'
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
const fieldClassName =
  'w-full rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-base text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-accent)] focus:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-70'

type FieldShellProps = {
  label: string
  error?: string
  helper?: string
  children: ReactNode
  fieldId?: string
  labelId?: string
}

function FieldShell({
  label,
  error,
  helper,
  children,
  fieldId,
  labelId,
}: FieldShellProps) {
  return (
    <div className="grid gap-2 text-sm text-white/72">
      {fieldId ? (
        <label id={labelId} htmlFor={fieldId} className="text-sm font-medium text-white">
          {label}
        </label>
      ) : (
        <span id={labelId} className="text-sm font-medium text-white">
          {label}
        </span>
      )}
      {children}
      {error ? (
        <p className="text-sm text-rose-200">{error}</p>
      ) : helper ? (
        <p className="text-sm text-white/42">{helper}</p>
      ) : null}
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
  ...props
}: TextInputFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell label={label} error={error} helper={helper} fieldId={fieldId}>
      <input
        {...props}
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={[fieldClassName, className].filter(Boolean).join(' ')}
      />
    </FieldShell>
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
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <FieldShell label={label} error={error} helper={helper} fieldId={fieldId}>
      <textarea
        {...props}
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={[
          fieldClassName,
          'min-h-[144px] resize-y rounded-[24px]',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    </FieldShell>
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

  return (
    <FieldShell label={label} error={error} helper={helper} labelId={labelId}>
      <div ref={wrapperRef} className="relative">
        <button
          id={buttonId}
          type="button"
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-labelledby={`${labelId} ${buttonId}`}
          className={[
            fieldClassName,
            'flex min-h-[52px] items-center justify-between text-left',
            open ? 'border-[var(--color-accent)] bg-white/[0.07]' : '',
            !selectedOption ? 'text-white/42' : '',
          ].join(' ')}
          onClick={() => {
            if (!disabled) {
              setOpen((current) => !current)
            }
          }}
        >
          <span>{selectedOption?.label ?? placeholder}</span>
          <ChevronDown
            size={18}
            className={[
              'shrink-0 text-white/48 transition',
              open ? 'rotate-180 text-[var(--color-accent)]' : '',
            ].join(' ')}
          />
        </button>

        {open ? (
          <div
            id={listboxId}
            role="listbox"
            aria-labelledby={labelId}
            className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-[24px] border border-white/12 bg-[#0f1520] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
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
                    <Check size={16} className="text-[var(--color-accent)]" />
                  ) : null}
                </button>
              )
            })}
          </div>
        ) : null}
      </div>
    </FieldShell>
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
        <span
          className={[
            'mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-md border transition',
            checked
              ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-slate-950 shadow-[0_0_0_4px_rgba(31,127,115,0.14)]'
              : 'border-white/18 bg-transparent text-transparent',
          ].join(' ')}
        >
          <Check size={14} strokeWidth={3} />
        </span>
        <span className="text-sm leading-6 text-white/72">
          {label}
          {required ? ' *' : ''}
        </span>
      </button>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  )
}
