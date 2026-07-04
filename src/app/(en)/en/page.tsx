import { HeroSection } from '@/components/hero/hero-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ProcessSection } from '@/components/sections/process-section'
import { ServicesSection } from '@/components/sections/services-section'

// Home en inglés: hero + servicios + proceso nuevos compartidos. Las secciones
// restantes llegan con las tareas de Fase 3/4 (mismo home completo que es).
export default function EnglishHomePage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main id="contenido-principal" className="relative overflow-hidden">
        <HeroSection locale="en" />
        <ServicesSection locale="en" />
        <ProcessSection locale="en" />
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
