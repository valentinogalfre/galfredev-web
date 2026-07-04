export type HeroMetric = {
  label: string
  value: string
  detail: string
}

export type HeroScenarioMessage = {
  align: 'left' | 'right'
  tone: 'neutral' | 'accent' | 'system'
  text: string
  hiddenOnMobile?: boolean
}

export type HeroScenarioCard = {
  label: string
  value: string
}

export type HeroScenario = {
  id: string
  headline: string
  panelTitle: string
  panelEyebrow: string
  panelStatus: string
  focusLabel: string
  focusValue: string
  tags: string[]
  messages: HeroScenarioMessage[]
  footerTitle: string
  footerDetail: string
  footerStatus: string
  cards: HeroScenarioCard[]
}

export type Certification = {
  id: string
  title: string
  issuer: string
  date: string
  image: string
}

export type SocialLink = {
  label: string
  href: string
}

export type ProfileOption = {
  value: string
  label: string
}

export type ProfileFormState = {
  fullName: string
  phone: string
  companyName: string
  avatarUrl: string
  businessType: string
  businessTypeOther: string
  teamSize: string
  teamSizeOther: string
  primaryNeed: string
  primaryNeedOther: string
  interests: string[]
  interestsOther: string
  preferredContactChannel: string
  preferredContactChannelOther: string
  newsletterOptIn: boolean
  commercialFollowUp: boolean
  profilingConsent: boolean
}

export type ProfileBundle = {
  fullName: string | null
  phone: string | null
  companyName: string | null
  avatarUrl: string | null
  businessType: string | null
  businessTypeOther: string | null
  teamSize: string | null
  teamSizeOther: string | null
  primaryNeed: string | null
  primaryNeedOther: string | null
  interests: string[]
  interestsOther: string | null
  preferredContactChannel: string | null
  preferredContactChannelOther: string | null
  newsletterOptIn: boolean
  commercialFollowUp: boolean
  profilingConsent: boolean
}

export type AuthUserSummary = {
  id: string
  email: string
  provider: string
  providerLabel: string
  displayName: string
  initials: string
  avatarUrl: string | null
  companyName: string | null
  hasCompletedProfile: boolean
}
