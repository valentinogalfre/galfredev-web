'use client'

import { AvatarUploader } from '@/components/profile/avatar-uploader'
import {
  profileBusinessTypeOptions,
  profileChannelOptions,
  profileInterestOptions,
  profileNeedOptions,
  profileOnboardingBenefits,
  profileTeamSizeOptions,
} from '@/content/profile-content'
import { validateProfileState } from '@/lib/profile'
import type { ProfileFormState } from '@/types/site'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CircleAlert,
  Mail,
  Phone,
  UserRound,
} from 'lucide-react'
import { startTransition, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type ProfileFormProps = {
  email: string
  providerLabel: string
  initialValues: ProfileFormState
  mode: 'onboarding' | 'edit'
  fallbackAvatarUrl?: string | null
}

type FieldErrors = Partial<Record<keyof ProfileFormState, string>>

type OptionGroupProps = {
  label: string
  helper?: string
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  otherValue?: string
  onOtherChange?: (value: string) => void
  otherLabel?: string
  error?: string
}

const fieldClassName =
  'w-full rounded-[22px] border border-white/10 bg-[rgba(255,255,255,0.04)] px-4 py-3 text-white outline-none transition placeholder:text-white/24 focus:border-[var(--color-accent)] focus:bg-white/[0.07]'

function OptionGroup({
  label,
  helper,
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
  otherLabel,
  error,
}: OptionGroupProps) {
  const showOther = value === 'otro' && onOtherChange

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {helper ? <p className="mt-1 text-sm text-white/52">{helper}</p> : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option.value

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                'rounded-full border px-4 py-2.5 text-sm transition duration-300 active:scale-[0.97]',
                active
                  ? 'border-[rgba(61,221,196,0.45)] bg-[rgba(31,127,115,0.18)] text-[#8ceada] shadow-[0_0_24px_rgba(31,127,115,0.25)]'
                  : 'border-white/10 bg-white/[0.03] text-white/62 hover:border-white/20 hover:bg-white/[0.06] hover:text-white',
              ].join(' ')}
            >
              {option.label}
            </button>
          )
        })}
      </div>

      <AnimatePresence initial={false}>
        {showOther ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            <input
              value={otherValue ?? ''}
              onChange={(event) => onOtherChange?.(event.target.value)}
              placeholder={otherLabel ?? 'Contanos tu respuesta'}
              className={fieldClassName}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      {error ? <p className="text-sm text-rose-200">{error}</p> : null}
    </div>
  )
}

export function ProfileForm({
  email,
  providerLabel,
  initialValues,
  mode,
  fallbackAvatarUrl,
}: ProfileFormProps) {
  const router = useRouter()
  const [form, setForm] = useState(initialValues)
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [topMessage, setTopMessage] = useState('')

  const validation = useMemo(() => validateProfileState(form), [form])
  const isOnboarding = mode === 'onboarding'

  const stepMeta = [
    {
      eyebrow: 'Paso 1',
      title: 'Datos básicos para reconocerte y seguir la conversación sin fricción',
      description:
        'Esto nos ayuda a identificarte rápido, adaptar el tono del contacto y mostrarte como usuario autenticado dentro del sitio.',
    },
    {
      eyebrow: 'Paso 2',
      title: 'Contexto de negocio para personalizar mejor el diagnóstico, la propuesta y el seguimiento',
      description:
        'Con un poco de contexto podemos priorizar automatizaciones relevantes y evitar reuniones o mensajes innecesarios.',
    },
  ] as const

  function updateField<K extends keyof ProfileFormState>(
    key: K,
    value: ProfileFormState[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
    setFieldErrors((current) => ({ ...current, [key]: undefined }))
    setTopMessage('')
  }

  function validateCurrentStep() {
    const nextErrors: FieldErrors = {}

    if (step === 0) {
      if (validation.errors.fullName) {
        nextErrors.fullName = validation.errors.fullName
      }

      if (validation.errors.phone) {
        nextErrors.phone = validation.errors.phone
      }

      if (validation.errors.avatarUrl) {
        nextErrors.avatarUrl = validation.errors.avatarUrl
      }
    } else {
      for (const key of [
        'businessTypeOther',
        'teamSizeOther',
        'primaryNeedOther',
        'preferredContactChannelOther',
      ] satisfies (keyof ProfileFormState)[]) {
        if (validation.errors[key]) {
          nextErrors[key] = validation.errors[key]
        }
      }
    }

    setFieldErrors((current) => ({ ...current, ...nextErrors }))
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (status === 'saving') {
      return
    }

    if (!validation.isValid) {
      setFieldErrors(validation.errors)
      setTopMessage('Revisá los campos marcados antes de guardar.')

      if (validation.errors.fullName || validation.errors.phone) {
        setStep(0)
      } else {
        setStep(1)
      }

      return
    }

    setStatus('saving')
    setTopMessage('')

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const result = (await response.json()) as {
        ok: boolean
        message: string
        redirectTo?: string
        errors?: FieldErrors
      }

      if (!response.ok || !result.ok) {
        setStatus('error')
        setTopMessage(result.message)
        setFieldErrors(result.errors ?? {})
        return
      }

      startTransition(() => {
        router.push(result.redirectTo ?? '/?profile=updated')
        router.refresh()
      })
    } catch {
      setStatus('error')
      setTopMessage('No se pudo guardar el perfil. Probá de nuevo en unos segundos.')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="page-panel p-4 sm:p-6 lg:p-8"
    >
      <div className="grid gap-8 xl:grid-cols-[0.82fr_1.18fr]">
        <aside className="order-2 space-y-5 xl:order-1">
          <div className="rounded-[1.7rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.02))] p-6">
            <p className="section-kicker">
              {isOnboarding ? 'Onboarding de perfil' : 'Perfil editable'}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-white">
              {isOnboarding
                ? 'Completá tu perfil para personalizar mejor el diagnóstico'
                : 'Tu perfil sigue disponible para editarlo cuando quieras'}
            </h1>
            <p className="mt-3 text-sm leading-7 text-white/58">
              {isOnboarding
                ? 'Pedimos solo el contexto que realmente ayuda a adaptar propuestas, priorizar automatizaciones útiles y ahorrar tiempo en conversaciones futuras.'
                : 'Acá podés releer tu información, actualizarla y mantener al día los datos que usamos para entender mejor tu negocio.'}
            </p>
          </div>

          <div className="rounded-[1.7rem] border border-[var(--surface-border)] bg-white/[0.03] p-5">
            <div className="flex items-center gap-3 text-white">
              <Mail size={18} aria-hidden className="text-[#3dddc4]" />
              <div>
                <p className="text-sm font-medium">{email}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-white/42">
                  Acceso por {providerLabel}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {stepMeta.map((item, index) => {
                const active = index === step
                const done = index < step

                return (
                  <button
                    key={item.eyebrow}
                    type="button"
                    onClick={() => setStep(index)}
                    className={[
                      'w-full rounded-[1.4rem] border px-4 py-4 text-left transition duration-300',
                      active
                        ? 'border-[rgba(61,221,196,0.3)] bg-[rgba(31,127,115,0.12)]'
                        : 'border-[var(--surface-border)] bg-black/18 hover:border-white/14 hover:bg-white/[0.04]',
                    ].join(' ')}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={[
                          'mt-0.5 inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold',
                          done || active
                            ? 'border-[rgba(61,221,196,0.35)] bg-[rgba(31,127,115,0.16)] text-[#8ceada]'
                            : 'border-white/10 text-white/42',
                        ].join(' ')}
                      >
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-white/38">
                          {item.eyebrow}
                        </p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-[var(--surface-border)] bg-white/[0.03] p-5">
            <p className="text-sm font-medium text-white">¿Para qué sirve esto?</p>
            <div className="mt-4 space-y-3">
              {profileOnboardingBenefits.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-[20px] border border-white/8 bg-black/18 px-4 py-3"
                >
                  <span className="mt-1 inline-flex size-2 rounded-full bg-[var(--color-accent)]" />
                  <p className="text-sm leading-6 text-white/58">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="order-1 space-y-5 xl:order-2">
          {topMessage ? (
            <div
              className={[
                'flex items-start gap-3 rounded-[24px] border px-4 py-4 text-sm',
                status === 'error'
                  ? 'border-rose-400/20 bg-rose-400/8 text-rose-100'
                  : 'border-white/10 bg-white/[0.03] text-white/72',
              ].join(' ')}
            >
              <CircleAlert size={18} className="mt-0.5 shrink-0" />
              <p>{topMessage}</p>
            </div>
          ) : null}

          <div className="rounded-[1.7rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-6">
            <p className="section-kicker">
              {stepMeta[step].eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-white">
              {stepMeta[step].title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-white/56">
              {stepMeta[step].description}
            </p>

            <div className="mt-8 space-y-6">
              <AnimatePresence mode="wait">
                {step === 0 ? (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <AvatarUploader
                      value={form.avatarUrl}
                      fallbackAvatarUrl={fallbackAvatarUrl}
                      displayName={form.fullName || form.companyName || email}
                      onChange={(value) => updateField('avatarUrl', value)}
                    />

                    {fieldErrors.avatarUrl ? (
                      <p className="text-sm text-rose-200">{fieldErrors.avatarUrl}</p>
                    ) : null}

                    <div className="grid gap-4 md:grid-cols-2 md:items-start">
                      <label className="grid gap-2 text-sm text-white/72">
                        <span className="inline-flex items-center gap-2 text-white">
                          <UserRound size={16} aria-hidden className="text-[#3dddc4]" />
                          Nombre
                        </span>
                        <input
                          value={form.fullName}
                          onChange={(event) => updateField('fullName', event.target.value)}
                          placeholder="Cómo querés que te llamemos"
                          className={fieldClassName}
                        />
                        {fieldErrors.fullName ? (
                          <p className="min-h-[3rem] text-sm text-rose-200">
                            {fieldErrors.fullName}
                          </p>
                        ) : (
                          <p className="min-h-[3rem] text-sm text-transparent">.</p>
                        )}
                      </label>

                      <label className="grid gap-2 text-sm text-white/72">
                        <span className="inline-flex items-center gap-2 text-white">
                          <Phone size={16} aria-hidden className="text-[#3dddc4]" />
                          WhatsApp o teléfono
                        </span>
                        <input
                          value={form.phone}
                          onChange={(event) => updateField('phone', event.target.value)}
                          placeholder="+54 9 351..."
                          className={fieldClassName}
                        />
                        {fieldErrors.phone ? (
                          <p className="min-h-[3rem] text-sm text-rose-200">
                            {fieldErrors.phone}
                          </p>
                        ) : (
                          <p className="min-h-[3rem] text-sm text-white/42">
                            Opcional, pero útil para responderte por el canal correcto.
                          </p>
                        )}
                      </label>
                    </div>

                    <label className="grid gap-2 text-sm text-white/72">
                      <span className="inline-flex items-center gap-2 text-white">
                        <Building2 size={16} aria-hidden className="text-[#3dddc4]" />
                        Empresa o marca
                      </span>
                      <input
                        value={form.companyName}
                        onChange={(event) => updateField('companyName', event.target.value)}
                        placeholder="Nombre del negocio, empresa o marca"
                        className={fieldClassName}
                      />
                      <p className="text-sm text-white/42">
                        Si todavía no tenés una marca definida, podés dejarlo vacío.
                      </p>
                    </label>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <OptionGroup
                      label="Rubro o tipo de negocio"
                      helper="Elegí la opción más cercana. Si no encaja, escribila con tus palabras."
                      options={profileBusinessTypeOptions}
                      value={form.businessType}
                      onChange={(value) => updateField('businessType', value)}
                      otherValue={form.businessTypeOther}
                      onOtherChange={(value) => updateField('businessTypeOther', value)}
                      otherLabel="Describí tu rubro"
                      error={fieldErrors.businessTypeOther}
                    />

                    <OptionGroup
                      label="Tamaño del equipo"
                      helper="Esto ayuda a estimar el nivel de operación y la prioridad de automatización."
                      options={profileTeamSizeOptions}
                      value={form.teamSize}
                      onChange={(value) => updateField('teamSize', value)}
                      otherValue={form.teamSizeOther}
                      onOtherChange={(value) => updateField('teamSizeOther', value)}
                      otherLabel="Contanos el tamaño aproximado"
                      error={fieldErrors.teamSizeOther}
                    />

                    <OptionGroup
                      label="Necesidad principal"
                      helper="Elegí el frente donde hoy más te ayudaría ordenar o automatizar."
                      options={profileNeedOptions}
                      value={form.primaryNeed}
                      onChange={(value) => updateField('primaryNeed', value)}
                      otherValue={form.primaryNeedOther}
                      onOtherChange={(value) => updateField('primaryNeedOther', value)}
                      otherLabel="Describí la necesidad principal"
                      error={fieldErrors.primaryNeedOther}
                    />

                    <OptionGroup
                      label="Canal preferido para seguir"
                      helper="Lo usamos para priorizar la próxima conversación y no insistir por donde no te sirve."
                      options={profileChannelOptions}
                      value={form.preferredContactChannel}
                      onChange={(value) => updateField('preferredContactChannel', value)}
                      otherValue={form.preferredContactChannelOther}
                      onOtherChange={(value) =>
                        updateField('preferredContactChannelOther', value)
                      }
                      otherLabel="Contanos cuál preferís"
                      error={fieldErrors.preferredContactChannelOther}
                    />

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-white">Intereses</p>
                        <p className="mt-1 text-sm text-white/52">
                          Marcá lo que te interesa explorar. Podés combinar varias opciones.
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {profileInterestOptions.map((option) => {
                          const active = form.interests.includes(option.value)

                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updateField(
                                  'interests',
                                  active
                                    ? form.interests.filter((item) => item !== option.value)
                                    : [...form.interests, option.value],
                                )
                              }
                              className={[
                                'rounded-full border px-4 py-2.5 text-sm transition',
                                active
                                  ? 'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/14 text-white shadow-[0_0_0_1px_rgba(31,127,115,0.22)]'
                                  : 'border-white/10 bg-white/[0.03] text-white/62 hover:border-white/20 hover:bg-white/[0.06] hover:text-white',
                              ].join(' ')}
                            >
                              {option.label}
                            </button>
                          )
                        })}
                      </div>
                      <input
                        value={form.interestsOther}
                        onChange={(event) => updateField('interestsOther', event.target.value)}
                        placeholder="Si querés sumar algo más, escribilo acá"
                        className={fieldClassName}
                      />
                    </div>

                    <div className="rounded-[26px] border border-white/10 bg-black/18 p-4">
                      <div className="flex items-center gap-2 text-white">
                        <BriefcaseBusiness
                          size={16}
                          aria-hidden
                          className="text-[#3dddc4]"
                        />
                        <p className="text-sm font-medium">
                          Preferencias y consentimiento
                        </p>
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          {
                            key: 'newsletterOptIn' as const,
                            label: 'Quiero recibir novedades por email.',
                          },
                          {
                            key: 'commercialFollowUp' as const,
                            label:
                              'Autorizo seguimiento comercial vinculado a esta consulta.',
                          },
                          {
                            key: 'profilingConsent' as const,
                            label:
                              'Acepto que esta información se use para personalizar el diagnóstico y la propuesta.',
                          },
                        ].map((item) => {
                          const active = form[item.key]

                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => updateField(item.key, !active)}
                              className={[
                                'flex w-full items-start gap-3 rounded-[20px] border px-4 py-3 text-left transition',
                                active
                                  ? 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/12'
                                  : 'border-white/8 bg-white/[0.02] hover:border-white/16 hover:bg-white/[0.04]',
                              ].join(' ')}
                            >
                              <span
                                className={[
                                  'mt-1 inline-flex size-5 shrink-0 rounded-full border transition',
                                  active
                                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] shadow-[0_0_0_4px_rgba(31,127,115,0.14)]'
                                    : 'border-white/18',
                                ].join(' ')}
                              />
                              <span className="text-sm leading-6 text-white/72">
                                {item.label}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep((current) => current - 1)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.035] px-5 py-3 text-sm text-white/82 transition duration-300 hover:border-white/24 hover:bg-white/[0.06] hover:text-white"
                >
                  <ArrowLeft size={16} aria-hidden />
                  Volver
                </button>
              ) : null}

              {step === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (validateCurrentStep()) {
                      setStep(1)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.18)] transition duration-300 hover:-translate-y-px hover:shadow-[0_18px_48px_rgba(31,127,115,0.24)] active:scale-[0.985]"
                >
                  Continuar
                  <ArrowRight size={16} aria-hidden />
                </button>
              ) : null}
            </div>

            {step === 1 ? (
              <button
                type="submit"
                disabled={status === 'saving'}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(61,221,196,0.18)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.18)] transition duration-300 hover:-translate-y-px hover:shadow-[0_18px_48px_rgba(31,127,115,0.24)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status === 'saving'
                  ? 'Guardando cambios...'
                  : isOnboarding
                    ? 'Guardar y volver al sitio'
                    : 'Guardar perfil'}
                <ArrowRight size={16} aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </form>
  )
}
