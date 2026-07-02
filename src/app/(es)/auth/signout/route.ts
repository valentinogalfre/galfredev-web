import { env, hasSupabaseEnv } from '@/lib/env'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'

function getCookieValue(cookieHeader: string | null, name: string) {
  return cookieHeader
    ?.split('; ')
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split('=')[1]
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const response = NextResponse.redirect(new URL('/login', requestUrl.origin))

  if (!hasSupabaseEnv()) {
    return response
  }

  try {
    const supabase = createServerClient(
      env.supabaseUrl,
      env.supabasePublishableKey,
      {
        cookies: {
          get(name: string) {
            return getCookieValue(request.headers.get('cookie'), name)
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({ name, value: '', ...options })
          },
        },
      },
    )

    await supabase.auth.signOut()
  } catch {
    return response
  }

  return response
}
