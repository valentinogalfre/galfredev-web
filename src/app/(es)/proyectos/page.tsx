import { ProjectsIndexPage } from '@/components/pages/projects-index-page'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // El template '%s | GalfreDev' del layout completa el título.
  title: 'Proyectos',
  description:
    'Casos reales en producción: bots de WhatsApp, apps, webs y software a medida construidos por GalfreDev, usados todos los días.',
  alternates: { canonical: '/proyectos' },
}

export default function Page() {
  return <ProjectsIndexPage locale="es" />
}
