import type { SocialLink } from '@/types/site'

// La página Sobre mí (historia, stack, certificaciones) vive en dict.about
// (src/content/{es,en}). Acá queda solo lo transversal: links y datos de marca.
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
