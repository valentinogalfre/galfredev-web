import { HeroSection } from '@/components/hero/hero-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ProcessSection } from '@/components/sections/process-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { ServicesSection } from '@/components/sections/services-section'

// Home en inglés: hero + servicios + proceso nuevos compartidos. Las secciones
// restantes llegan con las tareas de Fase 3/4 (mismo home completo que es).
export default function EnglishHomePage() {
  return (
    <>
      <SiteHeader locale="en" />
      {/* overflow-x-clip (no hidden): hidden crea un scroll container y rompe
          position:sticky del sticky-stack; clip recorta sin romperlo. */}
      <main id="contenido-principal" className="relative overflow-x-clip">
        <HeroSection locale="en" />
        <ServicesSection locale="en" />
        <ProjectsSection locale="en" />
        <ProcessSection locale="en" />
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
