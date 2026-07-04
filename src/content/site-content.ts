import type { Certification, SocialLink } from '@/types/site'

// certifications y stackGroups quedan para la página Sobre mí (Task 23).
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
  founderImage: '/images/founder/valentino-galfre.png',
  whatsappBaseMessage: 'Hola, me gustaría consultar por los servicios de GalfreDev.',
  email: 'galfredev@gmail.com',
}
