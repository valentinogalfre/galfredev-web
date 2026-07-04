import type { LeadValidationMessages } from '@/types/content'

export type LeadStatus = 'idle' | 'loading' | 'success' | 'error'

export type LeadFormState = {
  fullName: string
  email: string
  phone: string
  companyName: string
  businessType: string
  primaryNeed: string
  challenge: string
  consentFollowUp: boolean
  consentNewsletter: boolean
  consentPrivacy: boolean
  website: string
}

export type LeadPayload = LeadFormState & {
  elapsedMs: number
  source?: string
}

export type LeadFieldErrors = Partial<Record<keyof LeadFormState, string>>

export type LeadApiResponse = {
  ok: boolean
  message: string
  whatsappUrl?: string
  errors?: LeadFieldErrors
}

export type LeadValidationResult = {
  isValid: boolean
  errors: LeadFieldErrors
  normalized: LeadFormState
}

/**
 * Valores válidos de "necesidad principal" (labels es para el mensaje interno
 * de WhatsApp). Los options de UI viven en los diccionarios y DEBEN usar
 * estos mismos values: la API valida contra esta lista.
 */
const leadPrimaryNeedOptions = [
  { value: 'whatsapp', label: 'WhatsApp y captación' },
  { value: 'seguimiento', label: 'Seguimiento comercial' },
  { value: 'turnos', label: 'Turnos y recordatorios' },
  { value: 'cobranzas', label: 'Cobranzas y avisos' },
  { value: 'automatizacion-interna', label: 'Automatización interna' },
  { value: 'software-a-medida', label: 'Software a medida' },
] as const

const leadPrimaryNeedLabelMap = new Map<string, string>(
  leadPrimaryNeedOptions.map((option) => [option.value, option.label]),
)

/**
 * Mensajes por defecto (es): los usa la API (/api/lead) tal cual; el form
 * client pasa los del diccionario del locale activo.
 */
export const defaultLeadValidationMessages: LeadValidationMessages = {
  fullNameRequired: 'Necesitamos tu nombre para registrar la consulta.',
  fullNameTooLong: 'Usá un nombre un poco más corto.',
  emailRequired: 'Necesitamos un email para responderte.',
  emailInvalid: 'Ingresá un email válido.',
  emailTooLong: 'El email es demasiado largo.',
  phoneRequired: 'Necesitamos un WhatsApp para continuar el lead.',
  phoneInvalid: 'Ingresá un número de WhatsApp válido.',
  phoneReview: 'Revisá el número de WhatsApp antes de enviarlo.',
  companyTooLong: 'El nombre de la empresa es demasiado largo.',
  businessTypeTooLong: 'El rubro es demasiado largo.',
  primaryNeedRequired: 'Elegí la necesidad principal.',
  primaryNeedInvalid: 'Elegí una necesidad principal válida.',
  challengeRequired: 'Contanos el contexto para preparar mejor la propuesta.',
  challengeTooShort: 'Sumanos un poco más de contexto para entender la consulta.',
  challengeTooLong: 'Resumí un poco el contexto para poder revisarlo mejor.',
  consentPrivacyRequired:
    'Necesitamos tu consentimiento de privacidad para guardar este lead.',
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneDigitsRegex = /\D/g
const singleLineControlCharsRegex = /[\u0000-\u001F\u007F]+/g
const multilineControlCharsRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g
const MAX_FULL_NAME_LENGTH = 80
const MAX_EMAIL_LENGTH = 160
const MAX_PHONE_LENGTH = 24
const MAX_COMPANY_LENGTH = 120
const MAX_BUSINESS_TYPE_LENGTH = 80
const MAX_CHALLENGE_LENGTH = 1200
const MIN_CHALLENGE_LENGTH = 24

function cleanSingleLine(value: string) {
  return value.replace(singleLineControlCharsRegex, ' ').replace(/\s+/g, ' ').trim()
}

function cleanMultiline(value: string) {
  return value
    .replace(multilineControlCharsRegex, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function createInitialLeadFormState(): LeadFormState {
  return {
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    businessType: '',
    primaryNeed: '',
    challenge: '',
    consentFollowUp: true,
    consentNewsletter: false,
    consentPrivacy: false,
    website: '',
  }
}

export function getLeadPrimaryNeedLabel(value: string) {
  return leadPrimaryNeedLabelMap.get(value) ?? value
}

export function validateLeadPayload(payload: unknown): payload is LeadPayload {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const candidate = payload as Record<string, unknown>

  return (
    typeof candidate.fullName === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.phone === 'string' &&
    typeof candidate.companyName === 'string' &&
    typeof candidate.businessType === 'string' &&
    typeof candidate.primaryNeed === 'string' &&
    typeof candidate.challenge === 'string' &&
    typeof candidate.consentFollowUp === 'boolean' &&
    typeof candidate.consentNewsletter === 'boolean' &&
    typeof candidate.consentPrivacy === 'boolean' &&
    typeof candidate.website === 'string' &&
    typeof candidate.elapsedMs === 'number' &&
    Number.isFinite(candidate.elapsedMs) &&
    (typeof candidate.source === 'string' || typeof candidate.source === 'undefined')
  )
}

export function validateLeadForm(
  input: LeadFormState,
  messages: LeadValidationMessages = defaultLeadValidationMessages,
): LeadValidationResult {
  const normalized: LeadFormState = {
    fullName: cleanSingleLine(input.fullName),
    email: cleanSingleLine(input.email).toLowerCase(),
    phone: cleanSingleLine(input.phone),
    companyName: cleanSingleLine(input.companyName),
    businessType: cleanSingleLine(input.businessType),
    primaryNeed: cleanSingleLine(input.primaryNeed),
    challenge: cleanMultiline(input.challenge),
    consentFollowUp: input.consentFollowUp,
    consentNewsletter: input.consentNewsletter,
    consentPrivacy: input.consentPrivacy,
    website: cleanSingleLine(input.website),
  }

  const errors: LeadFieldErrors = {}

  if (!normalized.fullName) {
    errors.fullName = messages.fullNameRequired
  } else if (normalized.fullName.length > MAX_FULL_NAME_LENGTH) {
    errors.fullName = messages.fullNameTooLong
  }

  if (!normalized.email) {
    errors.email = messages.emailRequired
  } else if (!emailRegex.test(normalized.email)) {
    errors.email = messages.emailInvalid
  } else if (normalized.email.length > MAX_EMAIL_LENGTH) {
    errors.email = messages.emailTooLong
  }

  const phoneDigits = normalized.phone.replace(phoneDigitsRegex, '')
  if (!normalized.phone) {
    errors.phone = messages.phoneRequired
  } else if (phoneDigits.length < 8) {
    errors.phone = messages.phoneInvalid
  } else if (phoneDigits.length > 15 || normalized.phone.length > MAX_PHONE_LENGTH) {
    errors.phone = messages.phoneReview
  }

  if (normalized.companyName.length > MAX_COMPANY_LENGTH) {
    errors.companyName = messages.companyTooLong
  }

  if (normalized.businessType.length > MAX_BUSINESS_TYPE_LENGTH) {
    errors.businessType = messages.businessTypeTooLong
  }

  if (!normalized.primaryNeed) {
    errors.primaryNeed = messages.primaryNeedRequired
  } else if (!leadPrimaryNeedLabelMap.has(normalized.primaryNeed)) {
    errors.primaryNeed = messages.primaryNeedInvalid
  }

  if (!normalized.challenge) {
    errors.challenge = messages.challengeRequired
  } else if (normalized.challenge.length < MIN_CHALLENGE_LENGTH) {
    errors.challenge = messages.challengeTooShort
  } else if (normalized.challenge.length > MAX_CHALLENGE_LENGTH) {
    errors.challenge = messages.challengeTooLong
  }

  if (!normalized.consentPrivacy) {
    errors.consentPrivacy = messages.consentPrivacyRequired
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalized,
  }
}

type WhatsAppLeadLike = Pick<
  LeadFormState,
  | 'fullName'
  | 'email'
  | 'phone'
  | 'companyName'
  | 'businessType'
  | 'primaryNeed'
  | 'challenge'
  | 'consentFollowUp'
  | 'consentNewsletter'
  | 'consentPrivacy'
>

export function buildLeadWhatsAppMessage(lead: WhatsAppLeadLike) {
  const lines = [
    'Nuevo lead desde GalfreDev',
    '',
    `Nombre: ${lead.fullName}`,
    `Email: ${lead.email}`,
    `WhatsApp: ${lead.phone}`,
    lead.companyName ? `Empresa: ${lead.companyName}` : '',
    lead.businessType ? `Rubro: ${lead.businessType}` : '',
    `Necesidad principal: ${getLeadPrimaryNeedLabel(lead.primaryNeed)}`,
    `Contexto: ${lead.challenge}`,
    '',
    `Consentimiento comercial: ${lead.consentFollowUp ? 'Sí' : 'No'}`,
    `Consentimiento novedades: ${lead.consentNewsletter ? 'Sí' : 'No'}`,
    `Política de privacidad aceptada: ${lead.consentPrivacy ? 'Sí' : 'No'}`,
  ]

  return lines.filter(Boolean).join('\n')
}

export function buildDraftWhatsAppMessage(form: LeadFormState) {
  const validation = validateLeadForm(form)

  if (!validation.normalized.fullName && !validation.normalized.email) {
    return 'Hola, quiero consultar por los servicios de GalfreDev.'
  }

  return buildLeadWhatsAppMessage({
    ...validation.normalized,
    phone: validation.normalized.phone || 'No compartido todavía',
    primaryNeed: validation.normalized.primaryNeed || 'A definir',
    challenge:
      validation.normalized.challenge ||
      'Quiero continuar la conversación por WhatsApp y terminar de explicar el contexto.',
  })
}
