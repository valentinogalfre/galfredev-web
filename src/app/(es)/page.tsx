import { HeroSection } from '@/components/hero/hero-section'
import { SiteFooter } from '@/components/layout/site-footer'
import { SiteHeader } from '@/components/layout/site-header'
import { ProfileToast } from '@/components/profile/profile-toast'
import { BotDemoSection } from '@/components/sections/bot-demo-section'
import { ContactSection } from '@/components/sections/contact-section'
import { FounderSection } from '@/components/sections/founder-section'
import { ProcessSection } from '@/components/sections/process-section'
import { ProfileTeaserSection } from '@/components/sections/profile-teaser-section'
import { ProjectsSection } from '@/components/sections/projects-section'
import { RoiCalculatorSection } from '@/components/sections/roi-calculator-section'
import { ServicesSection } from '@/components/sections/services-section'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

type HomePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const profileStatus = Array.isArray(params.profile)
    ? params.profile[0]
    : params.profile

  return (
    <>
      <SiteHeader locale="es" />
      <ProfileToast initialVisible={profileStatus === 'updated'} />
      <div id="top" />
      {/* overflow-x-clip (no hidden): hidden crea un scroll container y rompe
          position:sticky del sticky-stack; clip recorta sin romperlo. */}
      <main id="contenido-principal" className="relative overflow-x-clip">
        <HeroSection locale="es" />
        <ServicesSection locale="es" />
        <ProjectsSection locale="es" />
        <BotDemoSection locale="es" />
        <ProcessSection locale="es" />
        <RoiCalculatorSection />
        <FounderSection />
        <ProfileTeaserSection />
        <ContactSection />
      </main>
      <SiteFooter locale="es" />
    </>
  )
}
