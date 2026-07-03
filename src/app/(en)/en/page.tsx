import { HeroSection } from '@/components/hero/hero-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'

// Home en inglés: hero nuevo compartido. Las secciones restantes llegan con
// las tareas de Fase 3/4 (mismo home completo que el locale es).
export default function EnglishHomePage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main id="contenido-principal" className="relative overflow-hidden">
        <HeroSection locale="en" />
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
