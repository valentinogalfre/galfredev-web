import { updateSession } from '@/lib/supabase/middleware'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  return updateSession(request)
}

/**
 * Solo las rutas que leen la sesión en el servidor (o la protegen). El resto
 * del sitio es estático y el cliente de Supabase del navegador refresca su
 * propio token: correr el proxy ahí sumaba una invocación por cada página y
 * asset (HDR, sitemap, OG) sin leer nunca la sesión.
 *
 * Si una página nueva lee el usuario en el servidor, se agrega acá.
 */
export const config = {
  matcher: [
    '/perfil/:path*',
    '/dashboard/:path*',
    '/login',
    '/auth/:path*',
    '/api/profile',
    '/api/lead',
  ],
}
