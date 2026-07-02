import { socialLinks, siteCopy } from '@/content/site-content'
import { env } from '@/lib/env'
import { fontVariables } from '@/lib/fonts'
import { RootShell } from '@/components/layout/root-shell'
import type { Metadata } from 'next'
import '../globals.css'

const metadataBase = new URL(env.siteUrl)

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: 'GalfreDev | Automatización, software a medida e IA aplicada',
    template: '%s | GalfreDev',
  },
  description:
    'GalfreDev diseña automatización para negocios, bots para WhatsApp, integraciones y software a medida en Argentina. Menos tareas manuales, más seguimiento y más control operativo.',
  keywords: [
    'automatización para negocios',
    'bots para WhatsApp',
    'software a medida',
    'integraciones',
    'seguimiento comercial',
    'automatización de procesos',
    'IA aplicada a negocios',
    'Córdoba',
    'Argentina',
  ],
  category: 'technology',
  openGraph: {
    title: 'GalfreDev | Automatización, software a medida e IA aplicada',
    description:
      'Automatización para negocios, bots para WhatsApp, integraciones y software a medida en Argentina.',
    url: env.siteUrl,
    siteName: 'GalfreDev',
    locale: 'es_AR',
    type: 'website',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'GalfreDev | Automatización, software a medida e IA aplicada',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GalfreDev | Automatización, software a medida e IA aplicada',
    description:
      'Automatización para negocios, bots para WhatsApp, integraciones y software a medida en Argentina.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fontVariables}>
      <RootShell locale="es">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: siteCopy.brand,
              url: env.siteUrl,
              email: siteCopy.email,
              description:
                'Automatización para negocios, bots para WhatsApp, integraciones y software a medida en Argentina.',
              serviceType: [
                'Automatización de procesos',
                'Bots para WhatsApp',
                'Integraciones',
                'Software a medida',
                'IA aplicada a negocios',
              ],
              areaServed: [
                {
                  '@type': 'Country',
                  name: 'Argentina',
                },
                {
                  '@type': 'City',
                  name: 'Córdoba',
                },
              ],
              founder: {
                '@type': 'Person',
                name: siteCopy.founderName,
              },
              sameAs: socialLinks
                .filter((item) => !item.href.startsWith('mailto:'))
                .map((item) => item.href),
            }),
          }}
        />
      </RootShell>
    </html>
  )
}
