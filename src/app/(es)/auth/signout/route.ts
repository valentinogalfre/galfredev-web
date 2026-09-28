import { hasSupabaseEnv } from '@/lib/env'
import { isSameOriginRequest } from '@/lib/security'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * Cerrar sesión cambia estado: solo POST (el form del perfil). Un GET podía
 * dispararse con un link ajeno o con el prefetch de un <Link>.
 */
export async function POST(request: Request) {
  const requestUrl = new URL(request.url)
  // 303: después del POST del form, el navegador sigue el redirect con GET.
  const response = NextResponse.redirect(new URL('/login', requestUrl.origin), 303)

  if (!hasSupabaseEnv() || !isSameOriginRequest(request)) {
    return response
  }

  try {
    const supabase = await createSupabaseServerClient()
    await supabase.auth.signOut()
  } catch {
    // Sin sesión o Supabase caído: igual se vuelve al login.
  }

  return response
}
