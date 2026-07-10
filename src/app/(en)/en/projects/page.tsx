import { ProjectsIndexPage } from '@/components/pages/projects-index-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // El template '%s | GalfreDev' del layout completa el título.
  title: 'Projects',
  description:
    'Real cases in production: WhatsApp bots, apps, websites and custom software built by GalfreDev, used every single day.',
  alternates: { canonical: '/en/projects' },
}

export default function Page() {
  return <ProjectsIndexPage locale="en" />
}
