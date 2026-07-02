import type { Metadata } from 'next'
import { env } from '@/lib/env'
import { fontVariables } from '@/lib/fonts'
import { RootShell } from '@/components/layout/root-shell'
import NotFoundContent from './(es)/not-found'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: '404 | GalfreDev',
  robots: {
    index: false,
    follow: false,
  },
}

// Not-found global: atrapa las URLs que no matchean ningún route group
// (ej. /zzz). Al no existir layout raíz (multiple root layouts), tiene que
// definir su propio <html>/<body>. Reusa el contenido del 404 de (es)
// porque español es el locale default del sitio.
export default function GlobalNotFound() {
  return (
    <html lang="es" className={fontVariables}>
      <RootShell locale="es">
        <NotFoundContent />
      </RootShell>
    </html>
  )
}
