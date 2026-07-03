import type {
  Certification,
  NavItem,
  ProcessStep,
  SolutionCard,
  SocialLink,
  ValuePillar,
} from '@/types/site'

export const navItems: NavItem[] = [
  { label: 'Soluciones', href: '#soluciones' },
  { label: 'Proceso', href: '#proceso' },
  { label: 'ROI', href: '#roi' },
  { label: 'Valentino', href: '#fundador' },
  { label: 'Contacto', href: '#contacto' },
]

export const valuePillars: ValuePillar[] = [
  {
    icon: '01',
    title: 'Responder rápido',
    summary:
      'WhatsApp, respuestas automáticas y recordatorios para que una consulta no se enfríe por demora.',
    points: ['Respuesta automática por WhatsApp', 'Seguimiento sin olvidos'],
  },
  {
    icon: '02',
    title: 'Ordenar procesos',
    summary:
      'Conecto herramientas, formularios y sistemas para que la operación deje de depender de parches.',
    points: ['Menos doble carga', 'Menos errores operativos'],
  },
  {
    icon: '03',
    title: 'Escalar con criterio',
    summary:
      'Cuando lo estándar no alcanza, diseñamos la pieza justa para crecer con una base más sólida.',
    points: ['Integración con tu caso real', 'Base mantenible y lista para crecer'],
  },
]

export const solutions: SolutionCard[] = [
  {
    label: 'WhatsApp',
    title: 'WhatsApp que capta y responde sin fricción',
    audience: 'Consultas diarias',
    pain: 'Hoy se enfrían oportunidades por demora o desorden.',
    outcome: 'Más velocidad de respuesta y mejor filtro comercial.',
    bullets: ['Respuestas con contexto', 'Filtro y derivación'],
    ctaLabel: 'Consultar precios',
    message:
      'Hola, quiero consultar precios por una solución de captación y respuesta automática por WhatsApp.',
  },
  {
    label: 'Ventas',
    title: 'Seguimiento comercial para no perder clientes',
    audience: 'Leads y cotizaciones',
    pain: 'Los leads quedan en pausa o sin próxima acción.',
    outcome: 'Seguimiento automático que mantiene viva la conversación.',
    bullets: ['Estados claros', 'Alertas y recordatorios'],
    ctaLabel: 'Pedir propuesta',
    message:
      'Hola, quiero pedir una propuesta para automatizar el seguimiento de potenciales clientes y ventas.',
  },
  {
    label: 'Operación',
    title: 'Turnos, recordatorios y reprogramaciones',
    audience: 'Agendas y reservas',
    pain: 'Las ausencias y cambios desordenan la operación.',
    outcome: 'Menos no-shows y una agenda más predecible.',
    bullets: ['Confirmación automática', 'Reprogramación simple'],
    ctaLabel: 'Ver si aplica a tu negocio',
    message:
      'Hola, quiero ver si una automatización de turnos, recordatorios y reprogramaciones aplica a mi negocio.',
  },
  {
    label: 'Sistema',
    title: 'Software a medida para ordenar y escalar',
    audience: 'Procesos que ya superaron planillas',
    pain: 'Los parches ya no alcanzan y todo empieza a trabarse.',
    outcome: 'Una base más sólida para operar, integrar y crecer.',
    bullets: ['Backends y paneles', 'Integraciones y APIs'],
    ctaLabel: 'Consultar solución',
    message:
      'Hola, quiero consultar por software a medida e integraciones para ordenar y escalar mi negocio.',
  },
]

export const processSteps: ProcessStep[] = [
  {
    step: '01',
    title: 'Diagnóstico de negocio',
    description:
      'Ubicamos dónde hoy se pierde tiempo, control o facturación y qué conviene atacar primero.',
    outcome: 'Queda definido el problema real, la prioridad y el impacto que vale la pena buscar.',
  },
  {
    step: '02',
    title: 'Implementación enfocada',
    description:
      'Armamos la solución con el nivel justo de automatización, integración o software, sin adornos innecesarios.',
    outcome: 'Se pone en marcha rápido y con sentido operativo, no como una capa extra de complejidad.',
  },
  {
    step: '03',
    title: 'Ajuste y mejora continua',
    description:
      'Medimos qué funcionó, corregimos fricción real y definimos el siguiente paso útil según uso.',
    outcome: 'La solución se mantiene viva y acompaña el crecimiento sin quedar congelada.',
  },
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
