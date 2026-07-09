const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  ''

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabasePublishableKey,
  /** Solo servidor. Opcionales: sin ellas el demo bot corre en modo guionado. */
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://galfredev.com',
  whatsappUrl:
    process.env.NEXT_PUBLIC_WHATSAPP_URL ??
    'https://wa.me/5493518922197?text=Hola%21%20Me%20gustar%C3%ADa%20consultar%20por%20los%20servicios%20de%20GalfreDev.',
} as const

export function hasSupabaseEnv() {
  return Boolean(env.supabaseUrl && env.supabasePublishableKey)
}

export function requireSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      'Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.',
    )
  }

  return {
    supabaseUrl: env.supabaseUrl,
    supabasePublishableKey: env.supabasePublishableKey,
  }
}
