import { hasSupabaseEnv } from '@/lib/env'
import { getPostLoginRedirect, isProfileComplete } from '@/lib/profile'
import { createSupabaseServerClient } from '@/lib/supabase/server'
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
  // El proveedor devuelve ?error=… cuando el usuario cancela o rechaza el
  // acceso: vuelve al login con aviso en vez de caer mudo en la home.
  const providerError = requestUrl.searchParams.get('error')
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, requestUrl.origin))

  if (!hasSupabaseEnv()) {
    return redirectTo('/')
  }

  if (providerError || !code) {
    return redirectTo(providerError ? '/login?error=auth' : '/')
  }

  try {
    // Cliente compartido (getAll/setAll sobre cookies()): las cookies de la
    // sesión nueva viajan en la respuesta que devuelva este handler, incluido
    // el redirect, sin copiarlas a mano.
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return redirectTo('/login?error=auth')
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return redirectTo('/login')
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

    return redirectTo(nextPath)
  } catch {
    return redirectTo('/login?error=auth')
  }
}
