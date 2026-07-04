'use client'

import { scriptedReply } from '@/lib/demo-bot-script'
import { cn } from '@/lib/utils'
import type { Locale } from '@/types/content'
import { CheckCheck, MessageCircle, Send } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

export type ChatRole = 'user' | 'bot'

export type ChatMessage = { id: number; from: ChatRole; text: string }

export type AutoplayMessage = { from: ChatRole; text: string }

/**
 * Transporte de mensajes. Recibe el historial completo (el último elemento es
 * el mensaje recién enviado por el visitante) y devuelve la respuesta del bot.
 * Task 18 inyecta acá la implementación real contra la API de Claude; si no
 * se provee, el chat usa el motor guionado local (`scriptedReply`).
 */
export type SendMessage = (
  history: ChatMessage[],
) => Promise<{ reply: string; mode: 'live' | 'scripted' }>

export type BotChatProps = {
  locale: Locale
  /** Nombre en el header de la ventana. Default: GalfreDev. */
  title?: string
  inputPlaceholder: string
  limitNote: string
  whatsappUrl: string
  /** Conversación demo que se reproduce sola al entrar al viewport. */
  autoplayScript: AutoplayMessage[]
  /** Chips de sugerencia: al tocarlos se envían como mensaje del usuario. */
  suggestions: string[]
  sendMessage?: SendMessage
}

/** Tope de mensajes por sesión de UI: después solo queda el CTA a WhatsApp. */
const MAX_MESSAGES = 30

/** Pausa con typing indicator entre mensajes del autoplay. */
const AUTOPLAY_STEP_MS = 600

const UI_COPY = {
  es: {
    online: 'en línea',
    whatsappCta: 'Seguir por WhatsApp',
    sendLabel: 'Enviar mensaje',
    messagesLabel: 'Conversación con el bot demo',
    typingLabel: 'Escribiendo…',
  },
  en: {
    online: 'online',
    whatsappCta: 'Continue on WhatsApp',
    sendLabel: 'Send message',
    messagesLabel: 'Conversation with the demo bot',
    typingLabel: 'Typing…',
  },
} as const

function randomReplyDelay() {
  return 700 + Math.random() * 400
}

function TypingDots({ side }: { side: ChatRole }) {
  return (
    <div className={cn('flex', side === 'user' ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded-2xl border px-4 py-3',
          side === 'user'
            ? 'rounded-br-md border-[rgba(61,221,196,0.25)] bg-[rgba(61,221,196,0.12)]'
            : 'rounded-bl-md border-white/10 bg-white/5',
        )}
      >
        {[0, 1, 2].map((dot) => (
          <span
            key={dot}
            className="size-1.5 rounded-full bg-[#3dddc4]/80 motion-safe:animate-bounce motion-reduce:opacity-60"
            style={{ animationDelay: `${dot * 140}ms`, animationDuration: '900ms' }}
          />
        ))}
      </div>
    </div>
  )
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.from === 'user'

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl border px-4 py-2.5 text-sm leading-6 sm:max-w-[78%]',
          isUser
            ? 'rounded-br-md border-[rgba(61,221,196,0.25)] bg-[rgba(61,221,196,0.14)] text-white/92'
            : 'rounded-bl-md border-white/10 bg-white/5 text-white/85',
        )}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {isUser ? (
          <span aria-hidden className="mt-1 flex justify-end text-[#3dddc4]/70">
            <CheckCheck size={13} strokeWidth={2.2} />
          </span>
        ) : null}
      </div>
    </div>
  )
}

/**
 * Ventana de chat estilo WhatsApp adaptada a la marca. Reproduce una
 * conversación demo al entrar al viewport (autoplay) hasta que el visitante
 * interactúa; de ahí en más responde con el transporte inyectado o con el
 * motor guionado local.
 */
export function BotChat({
  locale,
  title = 'GalfreDev',
  inputPlaceholder,
  limitNote,
  whatsappUrl,
  autoplayScript,
  suggestions,
  sendMessage,
}: BotChatProps) {
  const copy = UI_COPY[locale]

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typing, setTyping] = useState<ChatRole | null>(null)
  const [input, setInput] = useState('')
  // Señal de hidratación observable (data-ready): los e2e tipean recién cuando
  // los handlers existen — sin esto, bajo carga el fill+Enter llega antes de
  // hidratar y el mensaje se pierde (flake real reproducido en review).
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  // Autoplay: arranca al entrar al viewport y muere para siempre con la
  // primera interacción del visitante (los mensajes ya mostrados quedan).
  const [autoplayStarted, setAutoplayStarted] = useState(false)
  const [interacted, setInteracted] = useState(false)

  const windowRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextIdRef = useRef(0)
  const interactedRef = useRef(false)

  const limitReached = messages.length >= MAX_MESSAGES
  const sending = typing === 'bot' && interacted

  const appendMessage = useCallback((from: ChatRole, text: string) => {
    setMessages((current) => [...current, { id: nextIdRef.current++, from, text }])
  }, [])

  // Autoplay se dispara una sola vez, al ver la ventana.
  useEffect(() => {
    const node = windowRef.current
    if (!node || autoplayStarted) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setAutoplayStarted(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [autoplayStarted])

  // Reproducción secuencial del guion: typing indicator + mensaje, en loop.
  // La limpieza del efecto (interacción del visitante) cancela lo pendiente.
  useEffect(() => {
    if (!autoplayStarted || interacted) return

    let cancelled = false
    let timeout: ReturnType<typeof setTimeout>

    const playStep = (index: number) => {
      if (cancelled || index >= autoplayScript.length) {
        setTyping(null)
        return
      }

      setTyping(autoplayScript[index].from)
      timeout = setTimeout(() => {
        if (cancelled) return
        setTyping(null)
        appendMessage(autoplayScript[index].from, autoplayScript[index].text)
        playStep(index + 1)
      }, AUTOPLAY_STEP_MS)
    }

    playStep(0)

    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [autoplayStarted, interacted, autoplayScript, appendMessage])

  const stopAutoplay = useCallback(() => {
    if (interactedRef.current) return
    interactedRef.current = true
    setInteracted(true)
    // Si el guion estaba «escribiendo», ese indicador ya no corresponde.
    setTyping(null)
  }, [])

  // Auto-scroll al último mensaje (también cuando aparece el typing indicator).
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTo({ top: node.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  const deliver = useCallback(
    async (text: string) => {
      stopAutoplay()
      const history: ChatMessage[] = [
        ...messages,
        { id: nextIdRef.current, from: 'user', text },
      ]
      appendMessage('user', text)
      setTyping('bot')

      try {
        const { reply } = sendMessage
          ? await sendMessage(history)
          : await new Promise<{ reply: string; mode: 'scripted' }>((resolve) =>
              setTimeout(
                () => resolve({ reply: scriptedReply(locale, text), mode: 'scripted' }),
                randomReplyDelay(),
              ),
            )
        appendMessage('bot', reply)
      } catch {
        // Si el transporte real falla, degradamos al guion local: la demo
        // nunca queda muda.
        appendMessage('bot', scriptedReply(locale, text))
      } finally {
        setTyping(null)
      }
    },
    [appendMessage, locale, messages, sendMessage, stopAutoplay],
  )

  const submit = () => {
    const text = input.trim()
    if (!text || sending || limitReached) return
    setInput('')
    void deliver(text)
  }

  return (
    <div
      ref={windowRef}
      data-testid="bot-chat"
      data-ready={hydrated ? '' : undefined}
      className="overflow-hidden rounded-[1.75rem] border border-[var(--surface-border)] bg-[linear-gradient(180deg,#0b1422_0%,#070d17_100%)] shadow-[var(--surface-shadow-strong)]"
    >
      {/* Header estilo WhatsApp: avatar + estado en línea */}
      <div className="flex items-center gap-3 border-b border-[var(--surface-border)] bg-white/[0.03] px-4 py-3.5 sm:px-5">
        <span
          aria-hidden
          className="relative inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3dddc4,#1f7f73)] text-sm font-semibold text-slate-950"
        >
          G
          <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-[#0b1422] bg-emerald-400" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-white">{title}</p>
          <p className="flex items-center gap-1.5 text-xs text-emerald-300/90">
            <span aria-hidden className="size-1.5 rounded-full bg-emerald-400 motion-safe:animate-pulse" />
            {copy.online}
          </p>
        </div>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.3em] text-white/30 sm:block">
          demo
        </span>
      </div>

      {/* Mensajes */}
      <div
        ref={scrollRef}
        role="log"
        aria-live="polite"
        aria-label={copy.messagesLabel}
        className="h-[340px] space-y-3 overflow-y-auto bg-[radial-gradient(120%_90%_at_50%_0%,rgba(61,221,196,0.05),transparent_55%)] px-4 py-5 [scrollbar-width:thin] sm:h-[400px] sm:px-5"
      >
        {messages.map((message) => (
          <Bubble key={message.id} message={message} />
        ))}
        {typing ? (
          <>
            <TypingDots side={typing} />
            <span className="sr-only">{copy.typingLabel}</span>
          </>
        ) : null}
      </div>

      {/* Composer: chips + input, o solo el cierre cuando se alcanzó el tope */}
      <div className="border-t border-[var(--surface-border)] bg-white/[0.02] px-4 py-4 sm:px-5">
        {limitReached ? null : (
          <>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    if (sending) return
                    void deliver(suggestion)
                  }}
                  className="rounded-full border border-[rgba(61,221,196,0.22)] bg-[rgba(61,221,196,0.06)] px-3.5 py-1.5 text-xs font-medium text-[#7fe8d6] transition hover:border-[rgba(61,221,196,0.45)] hover:bg-[rgba(61,221,196,0.12)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                submit()
              }}
            >
              <input
                data-testid="bot-input"
                type="text"
                value={input}
                aria-label={inputPlaceholder}
                placeholder={inputPlaceholder}
                onChange={(event) => setInput(event.target.value)}
                onFocus={stopAutoplay}
                autoComplete="off"
                enterKeyHint="send"
                className="h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-[rgba(61,221,196,0.45)] focus:bg-white/[0.06]"
              />
              <button
                type="submit"
                aria-label={copy.sendLabel}
                disabled={sending || !input.trim()}
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#3dddc4,#1f7f73)] text-slate-950 transition enabled:hover:brightness-110 disabled:opacity-40"
              >
                <Send size={17} strokeWidth={2.2} />
              </button>
            </form>
          </>
        )}

        {/* CTA fijo a WhatsApp + microcopy del límite */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={copy.whatsappCta}
          className="mt-3 inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-105"
        >
          <MessageCircle size={17} strokeWidth={2.2} />
          {copy.whatsappCta}
        </a>

        <p className="mt-3 text-center text-xs leading-5 text-white/40">{limitNote}</p>
      </div>
    </div>
  )
}
