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
import { hreflangAlternates } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: '/en',
    ...hreflangAlternates('/', '/'),
  },
}

// Home en inglés: mismas secciones que la home es, con el dict en.
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
        <BotDemoSection locale="en" />
        <ProcessSection locale="en" />
        <RoiCalculatorSection locale="en" />
        <AboutTeaserSection locale="en" />
        <ContactSection locale="en" />
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
