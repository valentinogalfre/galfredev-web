import { env, hasSupabaseEnv } from '@/lib/env'
import { getPostLoginRedirect, isProfileComplete } from '@/lib/profile'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

type ProfileRow = {
  full_name: string | null
  company_name: string | null
}

type PreferencesRow = {
  business_type: string | null
  business_type_other: string | null
  primary_need: string | null
  primary_need_other: string | null
  interests: string[] | null
  interests_other: string | null
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const response = NextResponse.redirect(new URL('/', requestUrl.origin))

  if (!hasSupabaseEnv() || !code) {
    return response
  }

  try {
    const supabase = createServerClient(
      env.supabaseUrl,
      env.supabasePublishableKey,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', requestUrl.origin))
    }

    const [{ data: profile }, { data: preferences }] = await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, company_name')
        .eq('id', user.id)
        .maybeSingle<ProfileRow>(),
      supabase
        .from('user_preferences')
        .select(
          'business_type, business_type_other, primary_need, primary_need_other, interests, interests_other',
        )
        .eq('user_id', user.id)
        .maybeSingle<PreferencesRow>(),
    ])

    const nextPath = getPostLoginRedirect(
      isProfileComplete({
        fullName: profile?.full_name ?? null,
        companyName: profile?.company_name ?? null,
        businessType: preferences?.business_type ?? null,
        businessTypeOther: preferences?.business_type_other ?? null,
        primaryNeed: preferences?.primary_need ?? null,
        primaryNeedOther: preferences?.primary_need_other ?? null,
        interests: preferences?.interests ?? [],
        interestsOther: preferences?.interests_other ?? null,
      }),
    )

    const redirectResponse = NextResponse.redirect(new URL(nextPath, requestUrl.origin))

    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie)
    })

    return redirectResponse
  } catch {
    return NextResponse.redirect(new URL('/login?error=auth', requestUrl.origin))
  }
}
