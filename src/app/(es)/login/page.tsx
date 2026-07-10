import { LoginPanel } from '@/components/auth/login-panel'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { getCurrentUserContext } from '@/lib/user-context'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Acceso',
  description:
    'Ingresá a tu perfil de GalfreDev para guardar contexto, preferencias y datos útiles antes de avanzar con una propuesta o diagnóstico.',
  alternates: {
    canonical: '/login',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function LoginPage() {
  const userContext = await getCurrentUserContext()

  if (userContext) {
    redirect(userContext.postLoginRedirect)
  }

  return (
    <>
      <SiteHeader locale="es" />
      <main id="contenido-principal" className="relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(ellipse_at_50%_-12%,rgba(31,127,115,0.22),transparent_58%),radial-gradient(ellipse_at_78%_10%,rgba(255,180,106,0.06),transparent_28%)]" />
        <div className="relative mx-auto flex min-h-[76svh] w-full max-w-3xl flex-col items-center justify-center gap-10 text-center">
          <div className="space-y-5">
            <p className="section-kicker justify-center">Acceso liviano</p>
            <h1 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.05em] text-white sm:text-5xl">
              Ingresá una vez y dejá tu{' '}
              <em className="inline-block bg-[linear-gradient(95deg,#a5f0e0_5%,#3dddc4_45%,#2a9184_95%)] bg-clip-text pr-1 font-normal italic text-transparent [font-family:var(--font-instrument-serif),Georgia,serif]">
                contexto listo
              </em>{' '}
              para que la próxima conversación avance más rápido.
            </h1>
            <p className="mx-auto max-w-xl text-base leading-8 text-[var(--text-faint)] sm:text-lg">
              El perfil sirve para guardar datos básicos, entender mejor tu operación y adaptar diagnósticos o propuestas sin convertir el sitio en un portal complejo.
            </p>
          </div>

          <LoginPanel />
        </div>
      </main>
      <SiteFooter locale="es" />
    </>
  )
}
