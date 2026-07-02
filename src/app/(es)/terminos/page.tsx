import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de uso',
  description:
    'Condiciones generales de uso del sitio de GalfreDev, sus formularios, canales de contacto y alcance informativo.',
  alternates: {
    canonical: '/terminos',
  },
}

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main id="contenido-principal" className="relative overflow-hidden px-4 pb-18 pt-28 sm:px-6 lg:px-8 lg:pt-32">
        <div className="absolute inset-x-0 top-0 h-[440px] bg-[radial-gradient(circle_at_top,rgba(31,127,115,0.16),transparent_38%)]" />
        <article className="page-panel relative mx-auto max-w-4xl p-6 sm:p-8 lg:p-10">
          <p className="section-kicker">Términos</p>
          <h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white sm:text-[3.3rem]">
            Términos de uso
          </h1>
          <div className="legal-prose mt-8">
            <section>
              <h2>Objeto del sitio</h2>
              <p>
                Esta web presenta los servicios, soluciones, metodología y canales de contacto de GalfreDev.
                No constituye una plataforma SaaS pública ni un entorno contractual automático por sí mismo.
              </p>
            </section>
            <section>
              <h2>Uso permitido</h2>
              <p>
                La persona visitante puede navegar, calcular escenarios de ROI, dejar datos de contacto,
                iniciar sesión en su perfil y solicitar información. Queda prohibido el uso abusivo
                de formularios, endpoints o mecanismos de autenticación.
              </p>
            </section>
            <section>
              <h2>Propuestas y alcances</h2>
              <p>
                Toda propuesta comercial, alcance, presupuesto o implementación se define caso por caso.
                El contenido del sitio no reemplaza una evaluación específica del negocio ni constituye
                una garantía de resultado.
              </p>
            </section>
            <section>
              <h2>Disponibilidad</h2>
              <p>
                GalfreDev podrá actualizar, modificar o retirar secciones, textos, funcionalidades o
                mecanismos de acceso cuando resulte necesario para mantener el sitio seguro, claro y vigente.
              </p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  )
}
