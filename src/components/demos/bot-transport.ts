import type { ChatMessage, SendMessage } from '@/components/demos/bot-chat'
import type { Locale } from '@/types/content'

const STORAGE_KEY = 'demo-bot-session'
/** Debe coincidir con la validación del endpoint (/api/demo-bot). */
const SESSION_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/

/** Fallback por pestaña cuando localStorage está bloqueado (modo privado). */
let ephemeralSessionId: string | null = null

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // Contextos sin crypto.randomUUID (http no seguro): 32 hex pseudoaleatorios.
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function getSessionId(): string {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored && SESSION_ID_PATTERN.test(stored)) return stored
    const fresh = generateSessionId()
    window.localStorage.setItem(STORAGE_KEY, fresh)
    return fresh
  } catch {
    ephemeralSessionId ??= generateSessionId()
    return ephemeralSessionId
  }
}

/**
 * Transporte real del demo bot: POST a /api/demo-bot con el historial completo.
 * Ante cualquier problema (red, !res.ok, respuesta malformada) TIRA — BotChat
 * ya degrada al guion local, así que la demo nunca queda muda.
 */
export function createLiveTransport(locale: Locale): SendMessage {
  return async (history: ChatMessage[]) => {
    const res = await fetch('/api/demo-bot', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        sessionId: getSessionId(),
        locale,
        messages: history.map((message) => ({
          role: message.from === 'user' ? ('user' as const) : ('assistant' as const),
          content: message.text,
        })),
      }),
    })

    if (!res.ok) {
      throw new Error(`demo-bot API respondió ${res.status}`)
    }

    const body = (await res.json()) as { reply?: unknown; mode?: unknown }

    if (
      typeof body.reply !== 'string' ||
      body.reply.length === 0 ||
      (body.mode !== 'live' && body.mode !== 'scripted')
    ) {
      throw new Error('demo-bot API devolvió una respuesta malformada')
    }

    return { reply: body.reply, mode: body.mode }
  }
}
