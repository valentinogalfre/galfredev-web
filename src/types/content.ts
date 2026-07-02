export type Locale = 'es' | 'en'
export const LOCALES: Locale[] = ['es', 'en']
export const DEFAULT_LOCALE: Locale = 'es'

export type ServiceId =
  | 'bots-whatsapp'
  | 'webs'
  | 'apps'
  | 'automatizaciones-ia'
  | 'software-a-medida'

export type ProjectId = 'pyron' | 'pulso' | 'bot-ime' | 'orbita'

export type Cta = { label: string; href: string }

export type SeoMeta = { title: string; description: string }

export type ServiceContent = {
  id: ServiceId
  slug: string // slug localizado para la URL
  name: string // nombre corto (nav, cards)
  seo: SeoMeta
  hero: { eyebrow: string; title: string; italic: string; sub: string }
  benefits: { title: string; detail: string }[]
  demoTitle: string
  demoHint: string // invitación a usar la micro-demo
  relatedProjects: ProjectId[]
  whatsappMessage: string // mensaje prearmado del CTA
}

export type ProjectContent = {
  id: ProjectId
  slug: string
  name: string
  tagline: string
  seo: SeoMeta
  problem: string
  solution: string
  stack: string[]
  results: string[]
  services: ServiceId[]
  image: string // ruta bajo /public/images/projects/
}

export type HomeContent = {
  seo: SeoMeta
  hero: {
    eyebrow: string
    titlePrefix: string
    rotatingWords: string[]
    sub: string
    ctaPrimary: Cta
    ctaSecondary: Cta
    typedWords: string[]
  }
  services: { title: string; sub: string }
  projects: { title: string; sub: string }
  botDemo: { title: string; sub: string; inputPlaceholder: string; limitNote: string }
  process: { title: string; steps: { title: string; description: string; outcome: string }[] }
  roi: { title: string; sub: string }
  about: { title: string; teaser: string; cta: Cta }
  contact: { title: string; sub: string }
}

export type AboutContent = {
  seo: SeoMeta
  title: string
  story: string[]
  stackGroups: { label: string; items: string[] }[]
  certifications: { id: string; title: string; issuer: string; date: string; image: string }[]
}

export type CommonContent = {
  brand: string
  nav: { label: string; href: string }[]
  localeSwitch: string
  ctaTalk: string
  footer: { rights: string; madeIn: string }
  whatsappBaseMessage: string
  commandPalette: { placeholder: string; groups: { pages: string; actions: string } }
  notFound: { title: string; back: string }
}

export type Dictionary = {
  common: CommonContent
  home: HomeContent
  services: Record<ServiceId, ServiceContent>
  projects: Record<ProjectId, ProjectContent>
  about: AboutContent
}
