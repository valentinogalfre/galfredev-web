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
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [])

  useEffect(() => {
    if (status !== 'success' || !whatsAppHref) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      window.location.assign(whatsAppHref)
    }, 900)

    return () => window.clearTimeout(timeoutId)
  }, [status, whatsAppHref])

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
      noValidate
      onSubmit={handleSubmit}
      className="page-panel rounded-[2rem] p-6 sm:p-8"
    >
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
          className="group rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 transition duration-300 hover:translate-y-[-1px] hover:shadow-[0_14px_38px_rgba(31,127,115,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === 'loading' ? labels.submit.loading : labels.submit.idle}
        </button>
        <a
          href={directWhatsAppHref}
          target="_blank"
          rel="noreferrer"
          className="rounded-full border border-white/12 bg-white/[0.03] px-5 py-3 text-center text-sm text-white/82 transition duration-300 hover:border-white/24 hover:text-white"
        >
          {labels.whatsappDirect}
        </a>
      </div>

      {message ? (
        <div
          aria-live="polite"
          className={[
            'mt-5 rounded-[1.35rem] border px-4 py-4 text-sm',
            status === 'success'
              ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-100'
              : 'border-rose-400/20 bg-rose-400/8 text-rose-100',
          ].join(' ')}
        >
          <p>{message}</p>
          {status === 'success' && whatsAppHref ? (
            <a
              href={whatsAppHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white underline underline-offset-4"
            >
              {labels.messages.successCta}
              <ArrowRight size={16} />
            </a>
          ) : null}
        </div>
      ) : null}
    </form>
  )
}
