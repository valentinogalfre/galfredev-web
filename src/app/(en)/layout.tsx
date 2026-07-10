import { socialLinks, siteCopy } from '@/content/site-content'
import { env } from '@/lib/env'
import { fontVariables } from '@/lib/fonts'
import { getDictionary } from '@/lib/i18n'
import { RootShell } from '@/components/layout/root-shell'
import { JsonLd, ORG_ID, PERSON_ID, personSchema } from '@/components/seo/json-ld'
import type { Metadata } from 'next'
import '../globals.css'

const dict = getDictionary('en')

const metadataBase = new URL(env.siteUrl)

const enTitle = 'GalfreDev | Custom software, WhatsApp bots & applied AI'
const enDescription = dict.home.seo.description

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: enTitle,
    template: '%s | GalfreDev',
  },
  description: enDescription,
  keywords: [
    'business automation',
    'WhatsApp bots',
    'custom software',
    'integrations',
    'sales follow-up',
    'process automation',
    'applied AI for business',
    'Córdoba',
    'Argentina',
  ],
  category: 'technology',
  openGraph: {
    title: enTitle,
    description: enDescription,
    url: `${env.siteUrl}/en`,
    siteName: 'GalfreDev',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        // Static brand OG (the hero keyboard, rendered): light JPEG (<300KB)
        // because WhatsApp caches heavy images poorly. Global default;
        // services/projects override it with their per-segment
        // opengraph-image file convention (file-based wins over config).
        url: '/og-home.jpg',
        width: 1200,
        height: 630,
        alt: 'GalfreDev — Software that never sleeps. WhatsApp bots, websites, apps & AI.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: enTitle,
    description: enDescription,
    images: ['/og-home.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <RootShell locale="en">
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
            description: enDescription,
            serviceType: [
              'Process automation',
              'WhatsApp bots',
              'Integrations',
              'Custom software',
              'Applied AI for business',
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
