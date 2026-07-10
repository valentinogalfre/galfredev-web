export type LeadStatusValue =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal_sent'
  | 'won'
  | 'lost'
  | 'spam'

export const DEFAULT_LEAD_STATUS: LeadStatusValue = 'new'
export const CONTACT_FORM_SOURCE = 'website-contact-form'
