import { socialLinks, siteCopy } from '@/content/site-content'
import { env } from '@/lib/env'
import { fontVariables } from '@/lib/fonts'
import { RootShell } from '@/components/layout/root-shell'
import { JsonLd, ORG_ID, PERSON_ID, personSchema } from '@/components/seo/json-ld'
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
        // OG estática de marca (teclado del hero renderizado): JPEG liviano
        // (<300KB) porque WhatsApp cachea mal imágenes pesadas. Es el default
        // global; servicios/proyectos la overridean con su opengraph-image
        // file-convention por segmento (file-based gana sobre config).
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'GalfreDev — Software que no duerme. Bots de WhatsApp, webs, apps e IA.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GalfreDev | Automatización, software a medida e IA aplicada',
    description:
      'Automatización para negocios, bots para WhatsApp, integraciones y software a medida en Argentina.',
    images: ['/og-home.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={fontVariables}>
      <RootShell locale="es">
        {children}
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            '@id': ORG_ID,
            name: siteCopy.brand,
            url: env.siteUrl,
            // Google usa logo para el ícono en resultados enriquecidos.
            logo: `${env.siteUrl}/logo-512.png`,
            image: `${env.siteUrl}/og-home.jpg`,
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
            // Referencia por @id: la entidad Person completa se declara aparte
            // (personSchema) — una sola entidad en el grafo, sin duplicar.
            founder: { '@id': PERSON_ID },
            sameAs: socialLinks
              .filter((item) => !item.href.startsWith('mailto:'))
              .map((item) => item.href),
          }}
        />
        <JsonLd data={personSchema()} />
      </RootShell>
    </html>
  )
}
