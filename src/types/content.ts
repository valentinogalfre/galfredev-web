export type Locale = 'es' | 'en'
export const LOCALES: Locale[] = ['es', 'en']

export type ServiceId =
  | 'bots-whatsapp'
  | 'webs'
  | 'apps'
  | 'automatizaciones-ia'
  | 'software-a-medida'

export type ProjectId = 'pyron' | 'pulso' | 'bot-ime' | 'orbita'

type Cta = { label: string; href: string }

type SeoMeta = { title: string; description: string }

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

/** Mensajes de validación del form de leads (client + API con default es). */
export type LeadValidationMessages = {
  fullNameRequired: string
  fullNameTooLong: string
  emailRequired: string
  emailInvalid: string
  emailTooLong: string
  phoneRequired: string
  phoneInvalid: string
  phoneReview: string
  companyTooLong: string
  businessTypeTooLong: string
  primaryNeedRequired: string
  primaryNeedInvalid: string
  challengeRequired: string
  challengeTooShort: string
  challengeTooLong: string
  consentPrivacyRequired: string
}

/** Strings de UI de la calculadora ROI (la fórmula vive en src/lib/roi.ts). */
export type RoiCalculatorLabels = {
  salary: { label: string; help: string }
  hours: { label: string; help: string; unit: string; min: string; max: string }
  costNote: { before: string; after: string }
  chart: { title: string; sub: string; badge: string; ariaLabel: string }
  next: { kicker: string; before: string; after: string; cta: string }
  results: { monthly: string; hoursFree: string; annual: string }
  whatsapp: {
    intro: string
    salary: string
    hours: string
    monthly: string
    annual: string
    closing: string
  }
}

/** Strings de UI del formulario de contacto (POST a /api/lead intacto). */
export type ContactFormContent = {
  fields: {
    fullName: { label: string; placeholder: string }
    email: { label: string; placeholder: string }
    phone: { label: string; placeholder: string; helper: string }
    company: { label: string; placeholder: string }
    businessType: { label: string; placeholder: string }
    primaryNeed: {
      label: string
      placeholder: string
      options: { value: string; label: string }[]
    }
    challenge: { label: string; placeholder: string; helper: string }
  }
  consent: { followUp: string; newsletter: string; privacy: string }
  submit: { idle: string; loading: string }
  whatsappDirect: string
  validation: LeadValidationMessages
  messages: {
    validationSummary: string
    success: string
    successCta: string
    connectionError: string
    serverError: string
  }
}

type HomeContent = {
  seo: SeoMeta
  hero: {
    eyebrow: string
    titlePrefix: string
    rotatingWords: string[]
    sub: string
    ctaPrimary: Cta
    ctaSecondary: Cta
    typedWords: string[]
    soundOn: string
    soundOff: string
    eggMessage: string
  }
  services: { title: string; sub: string }
  projects: { title: string; sub: string }
  botDemo: { title: string; sub: string; inputPlaceholder: string; limitNote: string }
  process: { title: string; steps: { title: string; description: string; outcome: string }[] }
  roi: { title: string; sub: string; eyebrow: string; calculator: RoiCalculatorLabels }
  about: { title: string; teaser: string; cta: Cta }
  contact: {
    title: string
    sub: string
    intro: string
    whatsappCta: string
    whatsappMessage: string
    formNote: string
    form: ContactFormContent
  }
}

type AboutContent = {
  seo: SeoMeta
  title: string
  story: string[]
  stackGroups: { label: string; items: string[] }[]
  certifications: { id: string; title: string; issuer: string; date: string; image: string }[]
}

type CommonContent = {
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
