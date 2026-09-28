import { env, hasSupabaseEnv } from '@/lib/env'
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  if (!hasSupabaseEnv()) {
    return NextResponse.next({ request })
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      // El lote llega entero: una sesión OAuth suele venir partida en chunks
      // (sb-…-auth-token.0, .1). Recrear la respuesta por cookie (el adapter
      // get/set/remove anterior) conservaba solo el último chunk y el refresh
      // dejaba al usuario deslogueado.
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
        // no-store: una respuesta que setea la sesión jamás se cachea en CDN.
        Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const isProtected = pathname.startsWith('/perfil') || pathname.startsWith('/dashboard')

  if (!user && isProtected) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}
