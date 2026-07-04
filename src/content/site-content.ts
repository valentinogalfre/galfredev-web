import type { Certification, NavItem, SocialLink } from '@/types/site'

export const navItems: NavItem[] = [
  { label: 'Soluciones', href: '#soluciones' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'ROI', href: '#roi' },
  { label: 'Valentino', href: '#fundador' },
  { label: 'Contacto', href: '#contacto' },
]

export const certifications: Certification[] = [
  {
    id: 'ai-automation',
    title: 'AI Automation',
    issuer: 'Coderhouse',
    date: '23 de enero de 2026',
    image: '/images/certificates/ai-automation.png',
  },
  {
    id: 'english-advanced',
    title: 'Inglés para desarrollo nivel advanced',
    issuer: 'Coderhouse',
    date: '14 de junio de 2023',
    image: '/images/certificates/english-advanced.png',
  },
  {
    id: 'python',
    title: 'Python',
    issuer: 'Coderhouse',
    date: '13 de mayo de 2024',
    image: '/images/certificates/python.png',
  },
]

export const founderHighlights = [
  'Estudiante de Ingeniería en Sistemas de Información en UTN FRC.',
  'Cursos finalizados en Coderhouse: AI Automation, Inglés para desarrollo nivel advanced y Python.',
  'Actualmente cursando la carrera completa de Backend Developer en Coderhouse.',
  'Foco profesional en backend, automatización, integraciones, software a medida y sistemas con IA aplicados a negocios reales.',
]

export const stackGroups = [
  {
    label: 'Backend y datos',
    items: ['Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Supabase'],
  },
  {
    label: 'Frontend y experiencia',
    items: ['Next.js App Router', 'Framer Motion', 'Responsive UI', 'SEO técnico'],
  },
  {
    label: 'Automatización e IA',
    items: ['APIs', 'Bots', 'Integraciones', 'Workflows', 'IA aplicada'],
  },
]

export const socialLinks: SocialLink[] = [
  { label: 'X', href: 'https://x.com/galfredev' },
  { label: 'Instagram', href: 'https://www.instagram.com/valentinogalfre/' },
  { label: 'GitHub', href: 'https://github.com/galfredev' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/valentinogalfre/' },
  { label: 'Email', href: 'mailto:galfredev@gmail.com' },
]

export const siteCopy = {
  brand: 'GalfreDev',
  founderName: 'Valentino Galfré',
  founderRole: 'Automatización, software a medida e IA aplicada para negocios reales.',
  founderImage: '/images/founder/valentino-galfre.png',
  whatsappBaseMessage: 'Hola, me gustaría consultar por los servicios de GalfreDev.',
  email: 'galfredev@gmail.com',
}
