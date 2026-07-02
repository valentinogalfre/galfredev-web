import { socialLinks, siteCopy } from '@/content/site-content'
import { env } from '@/lib/env'
import { fontVariables } from '@/lib/fonts'
import { getDictionary } from '@/lib/i18n'
import { RootShell } from '@/components/layout/root-shell'
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
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: enTitle,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: enTitle,
    description: enDescription,
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <RootShell locale="en">
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
