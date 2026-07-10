import { evaluateLimit } from '@/lib/demo-bot-limit'
import { scriptedReply } from '@/lib/demo-bot-script'
import { env } from '@/lib/env'
import { isSameOriginRequest } from '@/lib/security'
import type { Locale } from '@/types/content'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

/** Formato del sessionId generado por el cliente (uuid o similar). */
const SESSION_ID_PATTERN = /^[a-zA-Z0-9-]{8,64}$/
const MAX_MESSAGE_CHARS = 500
const MAX_MESSAGES = 30
/** A Claude solo le pasamos la cola de la conversación: contexto suficiente, costo acotado. */
const CLAUDE_HISTORY_WINDOW = 10
/** Timeout defensivo de la llamada a Anthropic: si tarda más, degradamos al guion. */
const ANTHROPIC_TIMEOUT_MS = 20_000
/**
 * Cap secundario ANTI-ROTACIÓN: el sessionId lo elige el cliente, así que el
 * límite por visitante solo no alcanza (rotar uuids = cuota infinita). Una
 * misma IP no puede abrir más de N sesiones live por día; pasado el cap,
 * respondemos guionado. En Vercel el primer hop de x-forwarded-for lo setea
 * la plataforma (no spoofeable).
 */
const IP_DAILY_SESSION_CAP = 10
/** Largo máx. de una IP válida (IPv6 completa = 45 chars). */
const MAX_IP_CHARS = 45

type ChatTurn = { role: 'user' | 'assistant'; content: string }

const SYSTEM = (locale: Locale) => `Sos el asistente comercial de GalfreDev (Valentino Galfré, Córdoba, Argentina).
Servicios: bots de WhatsApp, webs, apps, automatizaciones e IA, software a medida.
Proyectos reales: Pyron (SaaS de gestión para matafuegos con facturación AFIP real), Pulso (app iOS de suscripciones), un asistente médico por WhatsApp para un instituto cordobés, Órbita (redes sociales con IA).
Objetivo: responder corto (máximo 3 oraciones), cálido y concreto, calificar la necesidad del visitante y derivarlo a WhatsApp para cotizar.
Nunca inventes precios exactos ni plazos firmes. No respondas temas ajenos a GalfreDev: redirigí con simpatía.
Respondé SIEMPRE en ${locale === 'es' ? 'español rioplatense (voseo)' : 'English'}.`

function isChatTurn(value: unknown): value is ChatTurn {
  if (typeof value !== 'object' || value === null) return false
  const turn = value as { role?: unknown; content?: unknown }
  return (
    (turn.role === 'user' || turn.role === 'assistant') &&
    typeof turn.content === 'string' &&
    turn.content.trim().length > 0 &&
    turn.content.length <= MAX_MESSAGE_CHARS
  )
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, message: 'No pudimos validar el origen de la solicitud.' },
      { status: 403 },
    )
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  const { sessionId, locale, messages } = (payload ?? {}) as {
    sessionId?: unknown
    locale?: unknown
    messages?: unknown
  }

  if (
    typeof sessionId !== 'string' ||
    !SESSION_ID_PATTERN.test(sessionId) ||
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_MESSAGES ||
    !messages.every(isChatTurn) ||
    messages[messages.length - 1].role !== 'user'
  ) {
    return NextResponse.json({ error: 'bad request' }, { status: 400 })
  }

  // Array.isArray narrowed `messages` to any[]; ya validado turno a turno.
  const turns: ChatTurn[] = messages

  const loc: Locale = locale === 'en' ? 'en' : 'es'
  const lastUserText = turns[turns.length - 1].content

  const scripted = (remaining?: number) =>
    NextResponse.json({
      reply: scriptedReply(loc, lastUserText),
      mode: 'scripted' as const,
      ...(remaining === undefined ? {} : { remaining }),
    })

  // Sin credenciales (Anthropic o Supabase service role) el modo live no existe:
  // respondemos guionado y la sección funciona igual (spec §9).
  if (!env.anthropicApiKey || !env.supabaseServiceRoleKey || !env.supabaseUrl) {
    return scripted()
  }

  try {
    const supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false },
    })

    const day = new Date().toISOString().slice(0, 10) // hoy en UTC
    const rawIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? ''
    // Solo guardamos algo con pinta de IP (el header es texto arbitrario).
    const ip = rawIp && rawIp.length <= MAX_IP_CHARS && /^[0-9a-fA-F:.]+$/.test(rawIp) ? rawIp : null

    // Cap por IP ANTES del upsert: además de cortar la rotación de sessionIds,
    // evita que el ataque llene la tabla de filas basura.
    if (ip) {
      const { count, error: capError } = await supabase
        .from('demo_bot_usage')
        .select('id', { count: 'exact', head: true })
        .eq('ip', ip)
        .eq('day', day)
      if (capError) throw capError
      if ((count ?? 0) >= IP_DAILY_SESSION_CAP) {
        return scripted(0)
      }
    }

    const { data: row, error: usageError } = await supabase
      .from('demo_bot_usage')
      .upsert({ visitor_id: sessionId, ip, day }, { onConflict: 'visitor_id,day' })
      .select('id,message_count')
      .single()

    // Tabla inexistente (migración sin aplicar) u otro error de DB → guion.
    if (usageError || !row) {
      throw usageError ?? new Error('demo_bot_usage upsert sin fila')
    }

    const { allowed, remaining } = evaluateLimit(row.message_count)

    if (!allowed) {
      return scripted(0)
    }

    // Sanitizado para Claude: cola de la conversación, empezando en un turno user
    // (el API exige que el primer mensaje sea del usuario).
    const window = turns.slice(-CLAUDE_HISTORY_WINDOW)
    while (window.length > 0 && window[0].role !== 'user') {
      window.shift()
    }

    const anthropic = new Anthropic({
      apiKey: env.anthropicApiKey,
      timeout: ANTHROPIC_TIMEOUT_MS,
      maxRetries: 0,
    })

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 300,
      system: SYSTEM(loc),
      messages: window,
    })

    const reply = response.content
      .find((block) => block.type === 'text')
      ?.text.trim()

    if (!reply) {
      throw new Error('Respuesta de Claude sin bloque de texto')
    }

    // Contador: si falla el update no matamos la respuesta live ya generada.
    const { error: updateError } = await supabase
      .from('demo_bot_usage')
      .update({ message_count: row.message_count + 1, updated_at: new Date().toISOString() })
      .eq('id', row.id)

    if (updateError) {
      console.error('demo-bot: fallo el update del contador', {
        code: updateError.code,
        message: updateError.message,
      })
    }

    return NextResponse.json({ reply, mode: 'live' as const, remaining: remaining - 1 })
  } catch (error) {
    // CUALQUIER excepción (tabla inexistente, API caída, timeout) degrada al
    // guion: el frontend nunca se rompe.
    console.error('demo-bot: modo live falló, degradando al guion', error)
    return scripted()
  }
}
