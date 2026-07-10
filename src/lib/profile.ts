import type { ProfileBundle, ProfileFormState } from '@/types/site'

const DATA_URL_IMAGE_PATTERN = /^data:image\/(png|jpe?g|webp);base64,/i
const CONTROL_CHARS_REGEX = /[\u0000-\u001F\u007F]+/g
const MAX_FULL_NAME_LENGTH = 80
const MAX_PHONE_LENGTH = 24
const MAX_COMPANY_LENGTH = 120
const MAX_OPTION_LENGTH = 80
const MAX_OTHER_LENGTH = 160
const MAX_INTERESTS = 8

function cleanString(value: string) {
  return value.replace(CONTROL_CHARS_REGEX, ' ').replace(/\s+/g, ' ').trim()
}

function cleanOptionalString(value: string) {
  const trimmed = cleanString(value)
  return trimmed.length > 0 ? trimmed : null
}

function createEmptyProfileState(): ProfileFormState {
  return {
    fullName: '',
    phone: '',
    companyName: '',
    avatarUrl: '',
    businessType: '',
    businessTypeOther: '',
    teamSize: '',
    teamSizeOther: '',
    primaryNeed: '',
    primaryNeedOther: '',
    interests: [],
    interestsOther: '',
    preferredContactChannel: '',
    preferredContactChannelOther: '',
    newsletterOptIn: false,
    commercialFollowUp: true,
    profilingConsent: false,
  }
}

export function createProfileState(bundle?: Partial<ProfileBundle>): ProfileFormState {
  return {
    ...createEmptyProfileState(),
    fullName: bundle?.fullName ?? '',
    phone: bundle?.phone ?? '',
    companyName: bundle?.companyName ?? '',
    avatarUrl: bundle?.avatarUrl ?? '',
    businessType: bundle?.businessType ?? '',
    businessTypeOther: bundle?.businessTypeOther ?? '',
    teamSize: bundle?.teamSize ?? '',
    teamSizeOther: bundle?.teamSizeOther ?? '',
    primaryNeed: bundle?.primaryNeed ?? '',
    primaryNeedOther: bundle?.primaryNeedOther ?? '',
    interests: bundle?.interests ?? [],
    interestsOther: bundle?.interestsOther ?? '',
    preferredContactChannel: bundle?.preferredContactChannel ?? '',
    preferredContactChannelOther: bundle?.preferredContactChannelOther ?? '',
    newsletterOptIn: bundle?.newsletterOptIn ?? false,
    commercialFollowUp: bundle?.commercialFollowUp ?? true,
    profilingConsent: bundle?.profilingConsent ?? false,
  }
}

function isValidAvatarDataUrl(value: string) {
  return DATA_URL_IMAGE_PATTERN.test(value)
}

function sanitizeInterestList(values: string[]) {
  return Array.from(
    new Set(
      values
        .map((value) => cleanString(value))
        .filter(Boolean)
        .slice(0, MAX_INTERESTS),
    ),
  )
}

function normalizeProfileState(form: ProfileFormState) {
  const interests = sanitizeInterestList(form.interests)
  const avatarUrl = cleanString(form.avatarUrl)

  return {
    fullName: cleanString(form.fullName),
    phone: cleanOptionalString(form.phone),
    companyName: cleanOptionalString(form.companyName),
    avatarUrl: avatarUrl.length === 0 ? null : isValidAvatarDataUrl(avatarUrl) ? avatarUrl : null,
    businessType: cleanOptionalString(form.businessType),
    businessTypeOther: cleanOptionalString(form.businessTypeOther),
    teamSize: cleanOptionalString(form.teamSize),
    teamSizeOther: cleanOptionalString(form.teamSizeOther),
    primaryNeed: cleanOptionalString(form.primaryNeed),
    primaryNeedOther: cleanOptionalString(form.primaryNeedOther),
    interests,
    interestsOther: cleanOptionalString(form.interestsOther),
    preferredContactChannel: cleanOptionalString(form.preferredContactChannel),
    preferredContactChannelOther: cleanOptionalString(
      form.preferredContactChannelOther,
    ),
    newsletterOptIn: form.newsletterOptIn,
    commercialFollowUp: form.commercialFollowUp,
    profilingConsent: form.profilingConsent,
  }
}

export function validateProfileState(form: ProfileFormState) {
  const normalized = normalizeProfileState(form)
  const errors: Partial<Record<keyof ProfileFormState, string>> = {}

  if (!normalized.fullName) {
    errors.fullName = 'Contanos cómo querés que te llamemos.'
  } else if (normalized.fullName.length > MAX_FULL_NAME_LENGTH) {
    errors.fullName = 'Usá un nombre un poco más corto.'
  }

  if (normalized.avatarUrl && !isValidAvatarDataUrl(normalized.avatarUrl)) {
    errors.avatarUrl = 'La imagen no tiene un formato válido.'
  }

  if (normalized.phone) {
    const digits = normalized.phone.replace(/\D/g, '')

    if (digits.length < 8 || digits.length > 15 || normalized.phone.length > MAX_PHONE_LENGTH) {
      errors.phone = 'Revisá el número de contacto.'
    }
  }

  if (normalized.companyName && normalized.companyName.length > MAX_COMPANY_LENGTH) {
    errors.companyName = 'El nombre de la empresa es demasiado largo.'
  }

  if (normalized.businessType && normalized.businessType.length > MAX_OPTION_LENGTH) {
    errors.businessType = 'El rubro es demasiado largo.'
  }

  if (normalized.teamSize && normalized.teamSize.length > MAX_OPTION_LENGTH) {
    errors.teamSize = 'El tamaño del equipo es demasiado largo.'
  }

  if (normalized.primaryNeed && normalized.primaryNeed.length > MAX_OPTION_LENGTH) {
    errors.primaryNeed = 'La necesidad principal es demasiado larga.'
  }

  if (
    normalized.preferredContactChannel &&
    normalized.preferredContactChannel.length > MAX_OPTION_LENGTH
  ) {
    errors.preferredContactChannel = 'El canal elegido es demasiado largo.'
  }

  if (normalized.businessType === 'otro' && !normalized.businessTypeOther) {
    errors.businessTypeOther = 'Sumá una breve descripción del rubro.'
  } else if (
    normalized.businessTypeOther &&
    normalized.businessTypeOther.length > MAX_OTHER_LENGTH
  ) {
    errors.businessTypeOther = 'Describilo con un poco menos de detalle.'
  }

  if (normalized.teamSize === 'otro' && !normalized.teamSizeOther) {
    errors.teamSizeOther = 'Contanos el tamaño aproximado del equipo.'
  } else if (normalized.teamSizeOther && normalized.teamSizeOther.length > MAX_OTHER_LENGTH) {
    errors.teamSizeOther = 'Describilo con un poco menos de detalle.'
  }

  if (normalized.primaryNeed === 'otro' && !normalized.primaryNeedOther) {
    errors.primaryNeedOther = 'Describí la necesidad principal.'
  } else if (
    normalized.primaryNeedOther &&
    normalized.primaryNeedOther.length > MAX_OTHER_LENGTH
  ) {
    errors.primaryNeedOther = 'Describila con un poco menos de detalle.'
  }

  if (
    normalized.preferredContactChannel === 'otro' &&
    !normalized.preferredContactChannelOther
  ) {
    errors.preferredContactChannelOther =
      'Indicá cuál es el mejor canal para contactarte.'
  } else if (
    normalized.preferredContactChannelOther &&
    normalized.preferredContactChannelOther.length > MAX_OTHER_LENGTH
  ) {
    errors.preferredContactChannelOther = 'Describilo con un poco menos de detalle.'
  }

  if (normalized.interestsOther && normalized.interestsOther.length > MAX_OTHER_LENGTH) {
    errors.interestsOther = 'Resumí un poco más ese interés.'
  }

  return {
    normalized,
    errors,
    isValid: Object.keys(errors).length === 0,
  }
}

export function deriveInitials(value: string) {
  const tokens = value
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 2)

  if (tokens.length === 0) {
    return 'GD'
  }

  return tokens.map((token) => token[0]?.toUpperCase() ?? '').join('')
}

export function isProfileComplete(
  bundle: Pick<
    ProfileBundle,
    | 'fullName'
    | 'companyName'
    | 'businessType'
    | 'businessTypeOther'
    | 'primaryNeed'
    | 'primaryNeedOther'
    | 'interests'
    | 'interestsOther'
  >,
) {
  if (!bundle.fullName?.trim()) {
    return false
  }

  const hasContext = Boolean(
    bundle.companyName?.trim() ||
      bundle.businessType?.trim() ||
      bundle.businessTypeOther?.trim() ||
      bundle.primaryNeed?.trim() ||
      bundle.primaryNeedOther?.trim() ||
      bundle.interests.length > 0 ||
      bundle.interestsOther?.trim(),
  )

  return hasContext
}

export function getPostLoginRedirect(hasCompletedProfile: boolean) {
  return hasCompletedProfile ? '/' : '/perfil'
}
