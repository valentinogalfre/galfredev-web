const SOURCE_PATTERN = /^[a-z0-9][a-z0-9-_]{0,63}$/i

export function isSameOriginRequest(request: Request) {
  const requestUrl = new URL(request.url)
  const originHeader = request.headers.get('origin')
  const refererHeader = request.headers.get('referer')

  if (originHeader) {
    try {
      return new URL(originHeader).origin === requestUrl.origin
    } catch {
      return false
    }
  }

  if (refererHeader) {
    try {
      return new URL(refererHeader).origin === requestUrl.origin
    } catch {
      return false
    }
  }

  return true
}

export function isJsonRequest(request: Request) {
  const contentType = request.headers.get('content-type')
  return typeof contentType === 'string' && contentType.includes('application/json')
}

export function normalizeSource(value: string | undefined, fallback: string) {
  const trimmed = value?.trim()

  if (!trimmed) {
    return fallback
  }

  return SOURCE_PATTERN.test(trimmed) ? trimmed : fallback
}

export function getSafeAuthErrorMessage(context: 'otp' | 'oauth') {
  if (context === 'otp') {
    return 'No pudimos enviar el enlace de acceso. Verificá el email e intentá nuevamente.'
  }

  return 'No pudimos iniciar el acceso con ese proveedor. Probá de nuevo en unos segundos.'
}

export function getSafeServerErrorMessage() {
  return 'Ocurrió un problema interno. Probá de nuevo en unos segundos.'
}
