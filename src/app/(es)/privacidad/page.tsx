import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Cómo trata GalfreDev los datos de contacto, preferencias y consentimientos dentro del sitio y sus formularios.',
  alternates: {
    canonical: '/privacidad',
  },
}

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido-principal" className="relative overflow-hidden px-4 pb-18 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_top,rgba(31,127,115,0.16),transparent_38%)]" />
        <article className="page-panel relative mx-auto max-w-4xl p-6 sm:p-8 lg:p-10">
          <p className="section-kicker">Privacidad</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-[3.3rem]">
            Política de privacidad
          </h1>
          <div className="legal-prose mt-8">
            <section>
              <h2>Qué datos se recopilan</h2>
              <p>
                GalfreDev puede recopilar nombre, email, WhatsApp, empresa, rubro, necesidad principal,
                preferencias de contacto y consentimientos cuando una persona completa formularios o crea un perfil.
              </p>
            </section>
            <section>
              <h2>Para qué se usan</h2>
              <p>
                Los datos se usan para responder consultas, preparar propuestas, dar seguimiento comercial autorizado,
                personalizar el contacto y entender mejor el tipo de problema que busca resolver cada visitante.
              </p>
            </section>
            <section>
              <h2>Base técnica y almacenamiento</h2>
              <p>
                El sitio utiliza Supabase para autenticación y base de datos. El despliegue está pensado para Vercel.
                No se exponen claves administrativas en el frontend y se separan identidad, perfil, preferencias, leads
                y consentimientos.
              </p>
            </section>
            <section>
              <h2>Derechos de la persona usuaria</h2>
              <p>
                Podés solicitar la actualización, corrección o eliminación de tus datos escribiendo a{' '}
                galfredev@gmail.com. Si diste consentimiento comercial, también podés retirarlo cuando quieras.
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
