'use client'

import { env, hasSupabaseEnv } from '@/lib/env'
import { getSafeAuthErrorMessage } from '@/lib/security'
import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { ArrowRight, Github, Linkedin, Mail } from 'lucide-react'
import { useState } from 'react'

type OAuthProvider = 'google' | 'github' | 'linkedin_oidc'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function LoginPanel() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'success'>(
    'idle',
  )
  const [message, setMessage] = useState('')

  function getRedirectTo() {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/auth/callback`
    }

    return `${env.siteUrl}/auth/callback`
  }

  async function handleMagicLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedEmail = email.trim().toLowerCase()

    if (!hasSupabaseEnv()) {
      setStatus('error')
      setMessage('Falta configurar Supabase para habilitar el acceso.')
      return
    }

    if (!emailRegex.test(normalizedEmail)) {
      setStatus('error')
      setMessage('Ingresá un email válido para continuar.')
      return
    }

    setStatus('loading')
    setMessage('')

    const supabase = createSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: getRedirectTo(),
      },
    })

    if (error) {
      setStatus('error')
      setMessage(getSafeAuthErrorMessage('otp'))
      return
    }

    setStatus('success')
    setMessage('Te enviamos un enlace mágico para continuar con tu perfil.')
  }

  async function handleOAuth(provider: OAuthProvider) {
    if (!hasSupabaseEnv()) {
      setStatus('error')
      setMessage('Falta configurar Supabase para habilitar el acceso.')
      return
    }

    if (status === 'loading') {
      return
    }

    setStatus('loading')
    setMessage('')

    const supabase = createSupabaseBrowserClient()
    const oauthOptions =
      provider === 'google'
        ? {
            redirectTo: getRedirectTo(),
            scopes: 'openid email profile https://www.googleapis.com/auth/userinfo.email',
          }
        : {
            redirectTo: getRedirectTo(),
          }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as never,
      options: oauthOptions,
    })

    if (error) {
      setStatus('error')
      setMessage(getSafeAuthErrorMessage('oauth'))
    }
  }

  return (
    <div className="relative w-full max-w-lg">
      {/* Glow teal detrás de la card */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-8 rounded-[3.5rem] bg-[radial-gradient(ellipse_at_50%_12%,rgba(31,127,115,0.3),transparent_68%)] blur-2xl"
      />

      <div
        className="page-panel relative p-6 text-left sm:p-8"
        style={{ borderColor: 'rgba(61, 221, 196, 0.22)' }}
      >
        <p className="text-center text-sm font-semibold tracking-[0.22em] text-white">
          GALFRE<span className="text-[var(--color-accent-strong)]">DEV</span>
        </p>

        <div className="mt-6 space-y-3 text-center">
          <h2 className="text-[2rem] font-semibold leading-[0.96] tracking-[-0.06em] text-white sm:text-[2.35rem]">
            Ingresá a tu perfil
          </h2>
          <p className="mx-auto max-w-md text-sm leading-7 text-[var(--text-faint)]">
            Guardá contexto, preferencias y consentimiento para que el diagnóstico y el
            seguimiento sean más claros desde la primera conversación.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            type="button"
            disabled={status === 'loading'}
            onClick={() => handleOAuth('google')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(61,221,196,0.22)] bg-[linear-gradient(180deg,rgba(50,148,134,0.98),rgba(31,127,115,0.92))] px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_14px_40px_rgba(31,127,115,0.2)] transition duration-300 hover:-translate-y-px hover:shadow-[0_18px_48px_rgba(31,127,115,0.28)] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-70"
          >
            Google
          </button>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              disabled={status === 'loading'}
              onClick={() => handleOAuth('github')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.035] px-5 py-3 text-sm text-white/82 transition duration-300 hover:border-white/24 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Github size={16} aria-hidden />
              GitHub
            </button>
            <button
              type="button"
              disabled={status === 'loading'}
              onClick={() => handleOAuth('linkedin_oidc')}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.035] px-5 py-3 text-sm text-white/82 transition duration-300 hover:border-white/24 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Linkedin size={16} aria-hidden />
              LinkedIn
            </button>
          </div>
        </div>

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.28em] text-white/34">
            o por email
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form className="space-y-4" onSubmit={handleMagicLink} noValidate>
          <label className="block">
            <span className="mb-2 block text-sm text-white/68">Email</span>
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-white/80 transition duration-300 focus-within:border-[var(--color-accent)] focus-within:bg-white/[0.07]">
              <Mail size={16} aria-hidden className="text-white/40" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)

                  if (status !== 'idle') {
                    setStatus('idle')
                    setMessage('')
                  }
                }}
                placeholder="tu@empresa.com"
                autoComplete="email"
                className="w-full bg-transparent text-base outline-none placeholder:text-white/28"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(61,221,196,0.3)] bg-[rgba(31,127,115,0.14)] px-5 py-3 text-sm font-semibold text-[#8ceada] transition duration-300 hover:border-[rgba(61,221,196,0.45)] hover:bg-[rgba(31,127,115,0.22)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {status === 'loading' ? 'Enviando enlace...' : 'Enviar enlace mágico'}
            <ArrowRight
              size={16}
              aria-hidden
              className="transition duration-300 group-hover:translate-x-0.5"
            />
          </button>
        </form>

        {message ? (
          <div
            aria-live="polite"
            className={[
              'mt-5 rounded-[1.4rem] border px-4 py-4 text-sm',
              status === 'success'
                ? 'border-emerald-400/20 bg-emerald-400/8 text-emerald-100'
                : 'border-rose-400/20 bg-rose-400/8 text-rose-100',
            ].join(' ')}
          >
            {message}
          </div>
        ) : null}

        {!hasSupabaseEnv() ? (
          <p className="mt-4 text-sm leading-7 text-amber-200/82">
            Supabase todavía no está configurado en este entorno. Los botones de acceso se
            muestran como referencia de UX.
          </p>
        ) : null}
      </div>
    </div>
  )
}
