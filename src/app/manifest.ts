import type { MetadataRoute } from 'next'

/** Manifest mínimo: identidad para navegadores/Android (ícono, colores de
 *  marca). display browser: es un sitio, no una PWA instalable. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GalfreDev',
    short_name: 'GalfreDev',
    description:
      'Bots de WhatsApp, webs, apps e IA aplicada. Software a medida que trabaja 24/7.',
    start_url: '/',
    display: 'browser',
    background_color: '#050810',
    theme_color: '#050810',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
