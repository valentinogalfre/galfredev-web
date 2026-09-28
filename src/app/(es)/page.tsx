import { HeroSection } from '@/components/hero/hero-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { AboutTeaserSection } from '@/components/sections/about-teaser-section'
import { BotDemoSection } from '@/components/sections/bot-demo-section'
import { ContactSection } from '@/components/sections/contact-section'
import { ProcessSection } from '@/components/sections/process-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { RoiCalculatorSection } from '@/components/sections/roi-calculator-section'
import { ServicesSection } from '@/components/sections/services-section'
import { getDictionary } from '@/lib/i18n'
import { hreflangAlternates, socialMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

const homeSeo = getDictionary('es').home.seo

export const metadata: Metadata = {
  // El title del hero nuevo (el default del layout queda como fallback de
  // páginas sin metadata propia: login, perfil, etc.).
  title: { absolute: homeSeo.title },
  description: homeSeo.description,
  alternates: {
    canonical: '/',
    ...hreflangAlternates('/', '/'),
  },
  ...socialMetadata({
    title: homeSeo.title,
    description: homeSeo.description,
    path: '/',
    locale: 'es',
  }),
}

// Sin searchParams: la home es estática (prerender + CDN), igual que /en.
export default function HomePage() {
  return (
    <>
      <SiteHeader locale="es" />
      <div id="top" />
      {/* overflow-x-clip (no hidden): hidden crea un scroll container y rompe
          position:sticky del sticky-stack; clip recorta sin romperlo. */}
      <main id="contenido-principal" className="relative overflow-x-clip">
        <HeroSection locale="es" />
        <ServicesSection locale="es" />
        <ProjectsSection locale="es" />
        <BotDemoSection locale="es" />
        <ProcessSection locale="es" />
        <RoiCalculatorSection locale="es" />
        <AboutTeaserSection locale="es" />
        <ContactSection locale="es" />
      </main>
      <SiteFooter locale="es" />
    </>
  )
}
