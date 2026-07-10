'use client'

import {
  ConsentCheckboxCard,
  SelectField,
  TextAreaField,
  TextInputField,
} from '@/components/ui/contact-form-fields'
import {
  type LeadApiResponse,
  type LeadFieldErrors,
  type LeadFormState,
  type LeadStatus,
  buildDraftWhatsAppMessage,
  createInitialLeadFormState,
  validateLeadForm,
} from '@/lib/contact'
import { CONTACT_FORM_SOURCE } from '@/lib/lead-model'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import type { ContactFormContent } from '@/types/content'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { useEffect, useRef, useState, type FocusEvent } from 'react'

/**
 * Celebración de envío: check que se dibuja + partículas teal + card con
 * spring. El texto de éxito es el del diccionario (los e2e lo verifican).
 */
function SuccessCelebration({
  message,
  ctaLabel,
  ctaHref,
}: {
  message: string
  ctaLabel: string
  ctaHref: string
}) {
  const reducedMotion = useReducedMotion()

  const particles = Array.from({ length: 10 }, (_, index) => {
    const angle = (index / 10) * Math.PI * 2 + 0.6
    const distance = 26 + ((index * 31) % 22)

    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      delay: 0.35 + (index % 5) * 0.03,
    }
  })

  return (
    <motion.div
      aria-live="polite"
      initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      className="relative mt-5 overflow-hidden rounded-[1.35rem] border border-[rgba(61,221,196,0.28)] bg-[rgba(61,221,196,0.08)] px-4 py-5"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(61,221,196,0.14),transparent_55%)]"
      />
      <div className="relative flex items-start gap-4">
        <span className="relative inline-flex size-11 shrink-0 items-center justify-center">
          {!reducedMotion
            ? particles.map((particle, index) => (
                <motion.span
                  key={index}
                  aria-hidden
                  initial={{ x: 0, y: 0, opacity: 0, scale: 1 }}
                  animate={{
                    x: particle.x,
                    y: particle.y,
                    opacity: [0, 1, 0],
                    scale: 0.35,
                  }}
                  transition={{ duration: 0.75, ease: 'easeOut', delay: particle.delay }}
                  className="absolute left-1/2 top-1/2 size-1.5 rounded-full bg-[#3dddc4] shadow-[0_0_10px_2px_rgba(61,221,196,0.55)]"
                />
              ))
            : null}
          <svg viewBox="0 0 44 44" fill="none" className="size-11">
            <motion.circle
              cx={22}
              cy={22}
              r={19}
              stroke="rgba(61,221,196,0.9)"
              strokeWidth={2.5}
              fill="rgba(61,221,196,0.1)"
              initial={reducedMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <motion.path
              d="M14 22.5l6 6L30.5 16.5"
              stroke="#b9ffef"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reducedMotion ? false : { pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: reducedMotion ? 0 : 0.32 }}
            />
          </svg>
        </span>
        <div className="min-w-0 pt-0.5 text-sm text-emerald-100">
          <p>{message}</p>
          {ctaHref ? (
            <motion.a
              href={ctaHref}
              target="_blank"
              rel="noreferrer"
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reducedMotion ? 0 : 0.4, duration: 0.3 }}
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white underline underline-offset-4"
            >
              {ctaLabel}
              <ArrowRight size={16} />
            </motion.a>
          ) : null}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Client component: formulario de leads. Todo el copy llega por props desde
 * el diccionario del locale; el POST a /api/lead no cambia (mismos campos,
 * misma validación compartida en src/lib/contact.ts).
 */
export function ContactForm({ labels }: { labels: ContactFormContent }) {
  const [form, setForm] = useState<LeadFormState>(createInitialLeadFormState)
  const [status, setStatus] = useState<LeadStatus>('idle')
  const [message, setMessage] = useState('')
  const [whatsAppHref, setWhatsAppHref] = useState('')
  const [fieldErrors, setFieldErrors] = useState<LeadFieldErrors>({})
  const startTimeRef = useRef<number>(0)
  const formRef = useRef<HTMLFormElement>(null)
  const reducedMotion = useReducedMotion()

  // Spotlight: un glow teal que viaja al campo enfocado dentro del form.
  const spotX = useMotionValue(0)
  const spotY = useMotionValue(0)
  const spotOpacity = useMotionValue(0)
  const spotSpringX = useSpring(spotX, { stiffness: 120, damping: 22 })
  const spotSpringY = useSpring(spotY, { stiffness: 120, damping: 22 })
  const spotVisibleRef = useRef(false)

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (status !== 'success' || !whatsAppHref) {
      return
    }

    // 1.6s: deja respirar la celebración (check dibujado) antes de saltar.
    const timeoutId = window.setTimeout(() => {
      window.location.assign(whatsAppHref)
    }, 1600)

    return () => window.clearTimeout(timeoutId)
  }, [status, whatsAppHref])

  function handleSpotlightFocus(event: FocusEvent<HTMLFormElement>) {
    if (reducedMotion || !formRef.current) {
      return
    }

    const target = event.target as HTMLElement

    // El honeypot está oculto (aria-hidden): el glow no lo delata.
    if (!target.matches('input, textarea, button, a') || target.closest('[aria-hidden="true"]')) {
      return
    }

    const targetRect = target.getBoundingClientRect()
    const formRect = formRef.current.getBoundingClientRect()
    const centerX = targetRect.left - formRect.left + targetRect.width / 2
    const centerY = targetRect.top - formRect.top + targetRect.height / 2

    if (!spotVisibleRef.current) {
      // Primer focus: aparece en el lugar, sin viajar desde el origen.
      spotX.jump(centerX)
      spotY.jump(centerY)
      spotVisibleRef.current = true
    } else {
      spotX.set(centerX)
      spotY.set(centerY)
    }

    animate(spotOpacity, 1, { duration: 0.35, ease: 'easeOut' })
  }

  function handleSpotlightBlur(event: FocusEvent<HTMLFormElement>) {
    if (reducedMotion) {
      return
    }

    if (!formRef.current?.contains(event.relatedTarget as Node)) {
      spotVisibleRef.current = false
      animate(spotOpacity, 0, { duration: 0.4, ease: 'easeOut' })
    }
  }

  function updateField<K extends keyof LeadFormState>(key: K, value: LeadFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))

    if (status !== 'idle') {
      setStatus('idle')
      setMessage('')
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (status === 'loading') {
      return
    }

    const validation = validateLeadForm(form, labels.validation)

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      setStatus('error')
      setMessage(labels.messages.validationSummary)
      return
    }

    setStatus('loading')
    setMessage('')
    setFieldErrors({})

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          elapsedMs: Date.now() - startTimeRef.current,
          source: CONTACT_FORM_SOURCE,
        }),
      })

      const result = (await response.json()) as LeadApiResponse

      if (!response.ok || !result.ok) {
        setStatus('error')
        // La API responde en es: acá se muestra el mensaje del diccionario del
        // locale activo (los field errors del server no ocurren en la práctica
        // porque la validación client corre primero con las mismas reglas).
        setMessage(
          result.errors ? labels.messages.validationSummary : labels.messages.serverError,
        )
        setFieldErrors(result.errors ?? {})
        return
      }

      setStatus('success')
      setMessage(labels.messages.success)
      setWhatsAppHref(result.whatsappUrl ?? '')
      setFieldErrors({})
      setForm(createInitialLeadFormState())
      startTimeRef.current = Date.now()
    } catch {
      setStatus('error')
      setMessage(labels.messages.connectionError)
    }
  }

  const directWhatsAppHref = buildWhatsAppUrl(buildDraftWhatsAppMessage(form))
  const { fields } = labels

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={handleSubmit}
      onFocusCapture={handleSpotlightFocus}
      onBlurCapture={handleSpotlightBlur}
      className="page-panel rounded-[2rem] p-6 sm:p-8"
    >
      {!reducedMotion ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 size-[340px] rounded-full"
          style={{
            x: spotSpringX,
            y: spotSpringY,
            translateX: '-50%',
            translateY: '-50%',
            opacity: spotOpacity,
            background:
              'radial-gradient(circle, rgba(61,221,196,0.13), rgba(61,221,196,0.045) 42%, transparent 70%)',
            filter: 'blur(14px)',
          }}
        />
      ) : null}

      <div className="relative">
        <div className="grid gap-4 md:grid-cols-2">
          <TextInputField
            required
            label={fields.fullName.label}
            value={form.fullName}
            error={fieldErrors.fullName}
            placeholder={fields.fullName.placeholder}
            autoComplete="name"
            disabled={status === 'loading'}
            onChange={(event) => updateField('fullName', event.target.value)}
          />
          <TextInputField
            required
            type="email"
            label={fields.email.label}
            value={form.email}
            error={fieldErrors.email}
            placeholder={fields.email.placeholder}
            autoComplete="email"
            disabled={status === 'loading'}
            onChange={(event) => updateField('email', event.target.value)}
          />
          <TextInputField
            required
            type="tel"
            inputMode="tel"
            label={fields.phone.label}
            value={form.phone}
            error={fieldErrors.phone}
            helper={fields.phone.helper}
            placeholder={fields.phone.placeholder}
            autoComplete="tel"
            disabled={status === 'loading'}
            onChange={(event) => updateField('phone', event.target.value)}
          />
          <TextInputField
            label={fields.company.label}
            value={form.companyName}
            placeholder={fields.company.placeholder}
            autoComplete="organization"
            disabled={status === 'loading'}
            onChange={(event) => updateField('companyName', event.target.value)}
          />
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <TextInputField
            label={fields.businessType.label}
            value={form.businessType}
            placeholder={fields.businessType.placeholder}
            autoComplete="organization-title"
            disabled={status === 'loading'}
            onChange={(event) => updateField('businessType', event.target.value)}
          />
          <SelectField
            label={fields.primaryNeed.label}
            value={form.primaryNeed}
            options={fields.primaryNeed.options}
            placeholder={fields.primaryNeed.placeholder}
            error={fieldErrors.primaryNeed}
            disabled={status === 'loading'}
            onChange={(value) => updateField('primaryNeed', value)}
          />
        </div>

        <div className="mt-4">
          <TextAreaField
            required
            rows={5}
            label={fields.challenge.label}
            value={form.challenge}
            error={fieldErrors.challenge}
            helper={fields.challenge.helper}
            placeholder={fields.challenge.placeholder}
            disabled={status === 'loading'}
            onChange={(event) => updateField('challenge', event.target.value)}
          />
        </div>

        <input
          value={form.website}
          onChange={(event) => updateField('website', event.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="sr-only"
        />

        <div className="mt-5 grid gap-3 rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-4">
          <ConsentCheckboxCard
            checked={form.consentFollowUp}
            disabled={status === 'loading'}
            label={labels.consent.followUp}
            onChange={(checked) => updateField('consentFollowUp', checked)}
          />
          <ConsentCheckboxCard
            checked={form.consentNewsletter}
            disabled={status === 'loading'}
            label={labels.consent.newsletter}
            onChange={(checked) => updateField('consentNewsletter', checked)}
          />
          <ConsentCheckboxCard
            required
            checked={form.consentPrivacy}
            disabled={status === 'loading'}
            error={fieldErrors.consentPrivacy}
            label={labels.consent.privacy}
            onChange={(checked) => updateField('consentPrivacy', checked)}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={status === 'loading'}
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:translate-y-[-1px] hover:shadow-[0_14px_38px_rgba(31,127,115,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? (
              <span
                aria-hidden
                className="size-3.5 motion-safe:animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950"
              />
            ) : null}
            {status === 'loading' ? labels.submit.loading : labels.submit.idle}
          </button>
          <a
            href={directWhatsAppHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-center text-sm text-white/82 transition duration-300 hover:border-[rgba(61,221,196,0.3)] hover:text-white"
          >
            <span className="relative inline-flex" aria-hidden>
              <MessageCircle size={15} className="relative z-10 text-[var(--color-accent)]" />
              <span
                className="absolute inset-0 rounded-full bg-[rgba(61,221,196,0.4)] motion-safe:animate-ping"
                style={{ animationDuration: '2.6s' }}
              />
            </span>
            {labels.whatsappDirect}
          </a>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {status === 'success' && message ? (
            <SuccessCelebration
              key="success"
              message={message}
              ctaLabel={labels.messages.successCta}
              ctaHref={whatsAppHref}
            />
          ) : message ? (
            <motion.div
              key={`error-${message}`}
              aria-live="polite"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: reducedMotion ? 0 : [0, -8, 8, -5, 5, 0],
              }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="mt-5 rounded-[1.35rem] border border-rose-400/20 bg-rose-400/8 px-4 py-4 text-sm text-rose-100"
            >
              <p>{message}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </form>
  )
}
