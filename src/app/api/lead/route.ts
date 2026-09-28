import {
  buildLeadWhatsAppMessage,
  validateLeadForm,
  validateLeadPayload,
} from '@/lib/contact'
import { CONTACT_FORM_SOURCE, DEFAULT_LEAD_STATUS } from '@/lib/lead-model'
import {
  getSafeServerErrorMessage,
  isJsonRequest,
  isSameOriginRequest,
  normalizeSource,
} from '@/lib/security'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { buildWhatsAppUrl } from '@/lib/whatsapp'
import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

const MAX_BODY_BYTES = 16 * 1024
const MIN_ELAPSED_MS = 1200
const MAX_ELAPSED_MS = 1000 * 60 * 30
const DEFAULT_SOURCE = CONTACT_FORM_SOURCE

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(
      { ok: false, message: 'No pudimos validar el origen de la solicitud.' },
      { status: 403 },
    )
  }

  if (!isJsonRequest(request)) {
    return NextResponse.json(
      { ok: false, message: 'El formato enviado no es válido.' },
      { status: 415 },
    )
  }

  // Un lead legítimo pesa <3 KB (todos los campos al máximo). Se corta antes
  // de parsear: el endpoint es público y no puede aceptar payloads arbitrarios.
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { ok: false, message: 'La solicitud es demasiado grande.' },
      { status: 413 },
    )
  }

  let payload: unknown

  try {
    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { ok: false, message: 'La solicitud es demasiado grande.' },
        { status: 413 },
      )
    }
    payload = JSON.parse(raw)
  } catch {
    return NextResponse.json(
      { ok: false, message: 'No se pudo leer la solicitud enviada.' },
      { status: 400 },
    )
  }

  if (!validateLeadPayload(payload)) {
    return NextResponse.json(
      { ok: false, message: 'Los datos enviados no tienen el formato esperado.' },
      { status: 400 },
    )
  }

  if (payload.website.trim()) {
    return NextResponse.json({ ok: true, message: 'Solicitud recibida.' })
  }

  const validation = validateLeadForm(payload)

  if (!validation.isValid) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Revisá los campos marcados antes de enviar la consulta.',
        errors: validation.errors,
      },
      { status: 400 },
    )
  }

  if (payload.elapsedMs < MIN_ELAPSED_MS) {
    return NextResponse.json(
      {
        ok: false,
        message: 'La solicitud fue demasiado rápida. Probá de nuevo en unos segundos.',
      },
      { status: 400 },
    )
  }

  if (payload.elapsedMs > MAX_ELAPSED_MS) {
    return NextResponse.json(
      {
        ok: false,
        message: 'La consulta venció antes de enviarse. Probá de nuevo desde el formulario.',
      },
      { status: 400 },
    )
  }

  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const source = normalizeSource(payload.source, DEFAULT_SOURCE)
    const leadId = crypto.randomUUID()
    const { normalized } = validation

    const { error: leadError } = await supabase.from('lead_intake').insert({
      id: leadId,
      user_id: user?.id ?? null,
      full_name: normalized.fullName,
      email: normalized.email,
      phone: normalized.phone,
      company_name: normalized.companyName || null,
      business_type: normalized.businessType || null,
      primary_need: normalized.primaryNeed,
      challenge: normalized.challenge,
      status: DEFAULT_LEAD_STATUS,
      source,
    })

    if (leadError) {
      console.error('Lead intake insert failed', {
        code: leadError.code,
        message: leadError.message,
        source,
      })

      return NextResponse.json(
        {
          ok: false,
          message: 'No pudimos registrar tu consulta en este momento.',
        },
        { status: 500 },
      )
    }

    const { error: consentError } = await supabase.from('marketing_consents').insert({
      lead_id: leadId,
      newsletter_opt_in: normalized.consentNewsletter,
      commercial_follow_up: normalized.consentFollowUp,
      profiling_opt_in: false,
      privacy_policy_accepted: normalized.consentPrivacy,
      source,
    })

    if (consentError) {
      console.error('Marketing consent insert failed', {
        code: consentError.code,
        message: consentError.message,
        source,
      })

      await supabase.from('lead_intake').delete().eq('id', leadId)

      return NextResponse.json(
        {
          ok: false,
          message: 'No pudimos completar el registro de tu consulta. Probá nuevamente.',
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      ok: true,
      message: 'Tu consulta quedó registrada. Te llevamos a WhatsApp para continuar.',
      whatsappUrl: buildWhatsAppUrl(buildLeadWhatsAppMessage(normalized)),
    })
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: getSafeServerErrorMessage(),
      },
      { status: 500 },
    )
  }
}
