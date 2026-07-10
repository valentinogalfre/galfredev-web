import type { Dictionary } from '@/types/content'

export const es: Dictionary = {
  common: {
    brand: 'GalfreDev',
    nav: [
      { label: 'Servicios', href: '/#servicios' },
      { label: 'Proyectos', href: '/proyectos' },
      { label: 'Proceso', href: '/#proceso' },
      { label: 'Sobre mí', href: '/sobre-mi' },
      { label: 'Contacto', href: '/#contacto' },
    ],
    localeSwitch: 'EN',
    ctaTalk: 'Hablemos',
    footer: {
      rights: 'Todos los derechos reservados.',
      madeIn: 'Hecho en Córdoba, Argentina.',
    },
    whatsappBaseMessage: 'Hola, me gustaría consultar por los servicios de GalfreDev.',
    commandPalette: {
      placeholder: 'Buscar páginas, servicios, proyectos…',
      groups: { pages: 'Páginas', actions: 'Acciones' },
    },
    notFound: {
      title: 'Esta página no existe (todavía).',
      back: 'Volver al inicio',
    },
  },

  home: {
    seo: {
      title: 'GalfreDev | Software a medida, bots de WhatsApp e IA aplicada',
      description:
        'Desarrollo webs, apps, bots de WhatsApp, automatizaciones e IA aplicada para negocios. Software a medida que trabaja 24/7. Córdoba, Argentina.',
    },
    hero: {
      eyebrow: 'CÓRDOBA, ARGENTINA — DISPONIBLE PARA PROYECTOS',
      titlePrefix: 'Software que',
      // La más ancha PRIMERO: la palabra rotativa re-emite candidatos LCP cuando
      // crece el área pintada del h1 — liderando con la más larga, las siguientes
      // rotaciones nunca vuelven a mover el LCP (gate Lighthouse del hero).
      rotatingWords: ['vende por vos.', 'no duerme.', 'atiende 24/7.'],
      sub: 'Bots de WhatsApp, webs, apps e IA aplicada. Construido a medida, trabajando todo el día para tu negocio.',
      ctaPrimary: { label: 'Empezar un proyecto', href: '#contacto' },
      ctaSecondary: { label: 'Ver proyectos', href: '/proyectos' },
      typedWords: ['WHATSAPP', 'APPS', 'WEBS', 'IA', 'AUTOMATIZAR'],
      soundOn: 'Activar sonido del teclado',
      soundOff: 'Silenciar el teclado',
      eggMessage: '> acceso concedido. sos de los míos.',
    },
    services: {
      title: 'Qué construyo',
      sub: 'Cinco formas de hacer que tu negocio trabaje solo.',
    },
    projects: {
      title: 'Casos reales',
      sub: 'Software en producción, usado todos los días.',
    },
    botDemo: {
      title: 'Probalo vos mismo',
      sub: 'Este bot es real: preguntale lo que quieras sobre mis servicios. Así atendería a tus clientes.',
      inputPlaceholder: 'Escribile al bot…',
      limitNote: 'Demo limitada por visitante. Para la versión completa, hablemos.',
    },
    process: {
      title: 'Cómo trabajo',
      steps: [
        {
          title: 'Diagnóstico de negocio',
          description:
            'Ubicamos dónde se pierde tiempo, control o facturación y qué conviene atacar primero.',
          outcome: 'Problema real definido, prioridad e impacto claros.',
        },
        {
          title: 'Implementación enfocada',
          description:
            'Armamos la solución con el nivel justo de automatización, integración o software.',
          outcome: 'En marcha rápido y con sentido operativo.',
        },
        {
          title: 'Ajuste y mejora continua',
          description:
            'Medimos qué funcionó, corregimos fricción real y definimos el siguiente paso útil.',
          outcome: 'La solución acompaña el crecimiento sin congelarse.',
        },
      ],
    },
    roi: {
      title: '¿Cuánto te devuelve?',
      sub: 'Calculá el retorno de automatizar tu operación.',
      eyebrow: 'Calculadora ROI',
      calculator: {
        salary: {
          label: 'Sueldo mensual del recurso',
          help: 'Ingresá el costo mensual del empleado o recurso que hoy hace esas tareas.',
        },
        hours: {
          label: 'Horas semanales en tareas repetitivas',
          help: 'Ajustá cuántas horas por semana se consumen en tareas que podríamos automatizar.',
          unit: 'hs',
          min: '1 hs',
          max: '40 hs',
        },
        costNote: {
          before: 'Hoy esas horas repetitivas te están costando aproximadamente',
          after: 'por mes.',
        },
        chart: {
          title: 'Proyección de ahorro a 12 meses',
          sub: 'Se acumula automáticamente mes a mes según el ahorro estimado actual.',
          badge: 'ROI visible',
          ariaLabel: 'Gráfico de ahorro acumulado de 12 meses',
        },
        next: {
          kicker: 'Siguiente paso',
          before: 'Si automatizás estas tareas, podés recuperar',
          after: 'al año. ¿Hablamos?',
          cta: 'Quiero automatizar',
        },
        results: {
          monthly: 'Ahorro / mes',
          hoursFree: 'Horas libres / mes',
          annual: 'Ahorro anual',
        },
        whatsapp: {
          intro: 'Hola, usé la calculadora ROI de GalfreDev.',
          salary: 'Sueldo mensual del recurso:',
          hours: 'Horas semanales en tareas repetitivas:',
          monthly: 'Ahorro mensual estimado:',
          annual: 'Ahorro anual proyectado:',
          closing: 'Quiero automatizar estas tareas.',
        },
      },
    },
    about: {
      title: 'Quién está detrás',
      teaser:
        'Soy Valentino Galfré: estudiante de Ingeniería en Sistemas y desarrollador. Construyo software real para negocios reales — de la idea a producción.',
      cta: { label: 'Conocé mi historia', href: '/sobre-mi' },
    },
    contact: {
      title: 'Hablemos',
      sub: 'Contame tu idea o tu problema. Respondo en el día.',
      intro:
        'La web resuelve el primer paso: mostrar qué hace GalfreDev, darte contexto y permitirte pedir un diagnóstico o una propuesta de forma clara. El cierre ideal es una conversación real.',
      whatsappCta: 'Hablar por WhatsApp',
      whatsappMessage:
        'Hola, quiero hablar por WhatsApp para evaluar automatizaciones o software a medida.',
      formNote:
        'También podés dejar tus datos y la necesidad principal para que el contacto salga con mejor contexto, prioridad y consentimiento explícito.',
      form: {
        fields: {
          fullName: { label: 'Nombre y apellido', placeholder: 'Cómo te llamás' },
          email: { label: 'Email', placeholder: 'tu@email.com' },
          phone: {
            label: 'WhatsApp',
            placeholder: '+54 9 351...',
            helper: 'Lo usamos para continuar el lead sin fricción.',
          },
          company: {
            label: 'Negocio o empresa',
            placeholder: 'Nombre del negocio o marca',
          },
          businessType: {
            label: 'Rubro',
            placeholder: 'Diseño, salud, servicios, e-commerce...',
          },
          primaryNeed: {
            label: 'Necesidad principal',
            placeholder: 'Elegí una opción',
            options: [
              { value: 'whatsapp', label: 'WhatsApp y captación' },
              { value: 'seguimiento', label: 'Seguimiento comercial' },
              { value: 'turnos', label: 'Turnos y recordatorios' },
              { value: 'cobranzas', label: 'Cobranzas y avisos' },
              { value: 'automatizacion-interna', label: 'Automatización interna' },
              { value: 'software-a-medida', label: 'Software a medida' },
            ],
          },
          challenge: {
            label: 'Contame el contexto',
            placeholder: 'Qué pasa hoy, qué querés ordenar y qué resultado esperás.',
            helper:
              'Cuanto más claro sea el contexto, mejor preparado sale el mensaje para WhatsApp.',
          },
        },
        consent: {
          followUp: 'Autorizo seguimiento comercial por email o WhatsApp.',
          newsletter:
            'Quiero recibir novedades sobre automatización, software e IA aplicada.',
          privacy:
            'Acepto la política de privacidad y el tratamiento de mis datos para este contacto.',
        },
        submit: { idle: 'Pedir propuesta o diagnóstico', loading: 'Enviando...' },
        whatsappDirect: 'Ir directo a WhatsApp',
        validation: {
          fullNameRequired: 'Necesitamos tu nombre para registrar la consulta.',
          fullNameTooLong: 'Usá un nombre un poco más corto.',
          emailRequired: 'Necesitamos un email para responderte.',
          emailInvalid: 'Ingresá un email válido.',
          emailTooLong: 'El email es demasiado largo.',
          phoneRequired: 'Necesitamos un WhatsApp para continuar el lead.',
          phoneInvalid: 'Ingresá un número de WhatsApp válido.',
          phoneReview: 'Revisá el número de WhatsApp antes de enviarlo.',
          companyTooLong: 'El nombre de la empresa es demasiado largo.',
          businessTypeTooLong: 'El rubro es demasiado largo.',
          primaryNeedRequired: 'Elegí la necesidad principal.',
          primaryNeedInvalid: 'Elegí una necesidad principal válida.',
          challengeRequired: 'Contanos el contexto para preparar mejor la propuesta.',
          challengeTooShort:
            'Sumanos un poco más de contexto para entender la consulta.',
          challengeTooLong: 'Resumí un poco el contexto para poder revisarlo mejor.',
          consentPrivacyRequired:
            'Necesitamos tu consentimiento de privacidad para guardar este lead.',
        },
        messages: {
          validationSummary: 'Revisá los campos marcados antes de enviar la consulta.',
          success:
            'Tu consulta quedó registrada. Te llevamos a WhatsApp para continuar.',
          successCta: 'Continuar por WhatsApp ahora',
          connectionError:
            'No pudimos enviar tu consulta por un problema de conexión. Probá de nuevo o escribinos por WhatsApp.',
          serverError: 'No pudimos registrar tu consulta en este momento.',
        },
      },
    },
  },

  services: {
    'bots-whatsapp': {
      id: 'bots-whatsapp',
      slug: 'bots-whatsapp',
      name: 'Bots de WhatsApp',
      seo: {
        title: 'Bots de WhatsApp para negocios | GalfreDev',
        description:
          'Bots de WhatsApp con IA que atienden consultas, filtran leads y agendan 24/7. Desarrollo a medida desde Córdoba, Argentina, con casos en producción.',
      },
      hero: {
        eyebrow: 'BOTS DE WHATSAPP',
        title: 'Atención que',
        italic: 'no se enfría.',
        sub: 'Tu negocio recibe consultas a toda hora. Un bot con IA las responde al instante, filtra a los curiosos y te deja los clientes listos para cerrar.',
      },
      benefits: [
        {
          title: 'Respuesta inmediata, siempre',
          detail:
            'Cada consulta se contesta en segundos, a las 3 de la tarde o a las 3 de la mañana. Nadie se va porque lo dejaron en visto.',
        },
        {
          title: 'Leads filtrados, no ruido',
          detail:
            'El bot hace las preguntas correctas y te acerca solo a las personas con intención real de comprar o reservar.',
        },
        {
          title: 'Agenda sin ida y vuelta',
          detail:
            'Turnos y reservas se coordinan dentro de la misma conversación, sin cadenas interminables de mensajes.',
        },
        {
          title: 'Habla como tu negocio',
          detail:
            'Entrenado con tu información real: precios, horarios, servicios. Responde con tu tono, no como un robot genérico.',
        },
      ],
      demoTitle: 'Probá un bot real',
      demoHint:
        'Escribile como si fueras un cliente: preguntale precios, horarios o servicios y mirá cómo responde.',
      relatedProjects: ['bot-ime', 'pyron'],
      whatsappMessage: 'Hola, quiero consultar por un bot de WhatsApp para mi negocio.',
    },

    webs: {
      id: 'webs',
      slug: 'webs',
      name: 'Webs',
      seo: {
        title: 'Desarrollo web profesional en Córdoba | GalfreDev',
        description:
          'Webs rápidas, animadas y con SEO técnico que convierten visitas en clientes. Diseño y desarrollo a medida desde Córdoba, Argentina.',
      },
      hero: {
        eyebrow: 'WEBS',
        title: 'Una web que',
        italic: 'vende sola.',
        sub: 'Rápida, animada y pensada para aparecer en Google. Este sitio que estás viendo es la mejor demo: así trabajo.',
      },
      benefits: [
        {
          title: 'Primera impresión que pesa',
          detail:
            'Diseño moderno con animaciones fluidas que transmite confianza en los primeros tres segundos.',
        },
        {
          title: 'Google te encuentra',
          detail:
            'SEO técnico desde el código: estructura, velocidad y contenido pensados para posicionar sin pagar publicidad.',
        },
        {
          title: 'Rápida en cualquier celular',
          detail:
            'Optimizada para cargar al instante en el teléfono más viejo con la peor señal. Ahí están tus clientes.',
        },
        {
          title: 'Hecha para convertir',
          detail:
            'Cada sección empuja hacia una acción concreta: consultar, comprar, agendar. Nada decorativo porque sí.',
        },
      ],
      demoTitle: 'La demo es este sitio',
      demoHint:
        'Recorrelo: las animaciones, la velocidad y el teclado 3D del inicio son el nivel de detalle que llevo a cada web.',
      relatedProjects: ['orbita'],
      whatsappMessage: 'Hola, quiero consultar por una web para mi negocio.',
    },

    apps: {
      id: 'apps',
      slug: 'apps',
      name: 'Apps',
      seo: {
        title: 'Desarrollo de apps iOS, Android y sistemas web | GalfreDev',
        description:
          'Apps móviles y sistemas web a medida que sacan tu operación de las planillas y el papel. Desarrollo profesional desde Córdoba, Argentina.',
      },
      hero: {
        eyebrow: 'APPS',
        title: 'Tu operación,',
        italic: 'en una app.',
        sub: 'Apps para iOS y Android y sistemas web que reemplazan planillas, papeles y cuadernos por una operación ordenada y a mano.',
      },
      benefits: [
        {
          title: 'Adiós a las planillas',
          detail:
            'Todo lo que hoy vive en Excel y papelitos pasa a un sistema centralizado que no se pierde ni se pisa.',
        },
        {
          title: 'Información en tiempo real',
          detail:
            'Sabés qué está pasando en tu negocio ahora, desde el celular, sin llamar a nadie para preguntar.',
        },
        {
          title: 'Diseñada para tu equipo',
          detail:
            'Pantallas simples que cualquiera aprende en minutos. Una app que tu equipo no usa no sirve — por eso la diseño pensando en ellos.',
        },
        {
          title: 'Crece con vos',
          detail:
            'Arquitectura pensada para sumar funciones sin volver a empezar: hoy turnos, mañana facturación, pasado reportes.',
        },
      ],
      demoTitle: 'Mirala en acción',
      demoHint:
        'Jugá con la demo interactiva y fijate cómo se siente una app hecha a medida, pulida hasta el último detalle.',
      relatedProjects: ['pulso', 'pyron'],
      whatsappMessage: 'Hola, quiero consultar por el desarrollo de una app.',
    },

    'automatizaciones-ia': {
      id: 'automatizaciones-ia',
      slug: 'automatizaciones-ia',
      name: 'Automatizaciones e IA',
      seo: {
        title: 'Automatizaciones e IA aplicada para negocios | GalfreDev',
        description:
          'Flujos que conectan tus herramientas e IA aplicada a tareas reales: menos carga manual, menos errores, más tiempo. Córdoba, Argentina.',
      },
      hero: {
        eyebrow: 'AUTOMATIZACIONES E IA',
        title: 'Trabajo repetitivo,',
        italic: 'nunca más.',
        sub: 'Conecto tus herramientas entre sí y les sumo IA donde aporta de verdad. Lo que hoy hacés a mano, mañana se hace solo.',
      },
      benefits: [
        {
          title: 'Cargá los datos una sola vez',
          detail:
            'Los sistemas se hablan entre sí: lo que entra por un lado aparece donde tiene que estar, sin copiar y pegar.',
        },
        {
          title: 'IA donde suma, no donde está de moda',
          detail:
            'Redacción, clasificación, generación de contenido: aplico IA a tareas concretas con resultado medible.',
        },
        {
          title: 'Menos errores humanos',
          detail:
            'Los procesos automáticos no se olvidan, no se cansan y no se equivocan al tipear.',
        },
        {
          title: 'Horas devueltas cada semana',
          detail:
            'Las tareas repetitivas dejan de consumir a tu equipo y ese tiempo vuelve a lo que genera plata.',
        },
      ],
      demoTitle: 'Mirala funcionar',
      demoHint:
        'Probá la demo interactiva y mirá cómo un flujo automatizado convierte una tarea de horas en segundos.',
      relatedProjects: ['orbita', 'bot-ime'],
      whatsappMessage: 'Hola, quiero consultar por automatizaciones e IA para mi negocio.',
    },

    'software-a-medida': {
      id: 'software-a-medida',
      slug: 'software-a-medida',
      name: 'Software a medida',
      seo: {
        title: 'Software a medida para empresas | GalfreDev',
        description:
          'Sistemas completos hechos a medida: backend, panel de gestión y facturación electrónica. Para cuando lo estándar no alcanza. Córdoba, Argentina.',
      },
      hero: {
        eyebrow: 'SOFTWARE A MEDIDA',
        title: 'Cuando lo estándar',
        italic: 'no alcanza.',
        sub: 'Si el software genérico te queda chico, construyo el sistema completo: backend, panel de gestión y hasta facturación electrónica.',
      },
      benefits: [
        {
          title: 'Todo en un solo sistema',
          detail:
            'Órdenes de trabajo, clientes, stock, facturación: una sola fuente de verdad en lugar de cinco herramientas desconectadas.',
        },
        {
          title: 'Se adapta a tu forma de trabajar',
          detail:
            'No forzás tu operación a lo que un software enlatado permite: el sistema se construye alrededor de tus procesos.',
        },
        {
          title: 'Facturación y papeles al día',
          detail:
            'Integración con AFIP, comprobantes y reportes: la parte administrativa se resuelve dentro del mismo sistema.',
        },
        {
          title: 'Evoluciona con tu empresa',
          detail:
            'Arranca resolviendo lo urgente y crece módulo a módulo, sin migraciones traumáticas ni volver a cero.',
        },
      ],
      demoTitle: 'Explorá un sistema real',
      demoHint:
        'Usá la demo interactiva para recorrer cómo se ve un sistema a medida por dentro: paneles, flujos y datos vivos.',
      relatedProjects: ['pyron'],
      whatsappMessage: 'Hola, quiero consultar por un software a medida para mi empresa.',
    },
  },

  projects: {
    pyron: {
      id: 'pyron',
      slug: 'pyron',
      name: 'Pyron',
      tagline: 'El sistema que administra empresas de matafuegos de punta a punta.',
      seo: {
        title: 'Pyron — SaaS de gestión para empresas de matafuegos | GalfreDev',
        description:
          'Caso real: sistema completo con órdenes de trabajo, facturación AFIP con CAE real, etiquetas QR verificables públicamente y bot de WhatsApp.',
      },
      problem:
        'Las empresas de matafuegos manejan una operación regulada — recargas, vencimientos, trazabilidad — con planillas y papeles que no escalan ni resisten una auditoría.',
      solution:
        'Un sistema completo hecho a medida: órdenes de trabajo, facturación electrónica AFIP real (Factura C con CAE), etiquetas QR que cualquier persona puede verificar públicamente, bot de WhatsApp y una PWA con escaneo y OCR para trabajar en la calle.',
      stack: ['Next.js', 'tRPC', 'PostgreSQL', 'Railway', 'Vercel', 'Claude'],
      results: [
        'En producción con clientes reales facturando',
        'Facturación electrónica AFIP emitiendo CAE real',
        'Etiquetas QR verificables por cualquier persona',
      ],
      services: ['software-a-medida', 'apps', 'automatizaciones-ia'],
      image: '/images/projects/pyron.png',
    },

    pulso: {
      id: 'pulso',
      slug: 'pulso',
      name: 'Pulso',
      tagline: 'Tus suscripciones, bajo control y a la vista.',
      seo: {
        title: 'Pulso — app iOS para controlar suscripciones | GalfreDev',
        description:
          'Caso real: app nativa para iPhone que pone tus gastos recurrentes a la vista, con recordatorios, diseño premium animado y 186 tests en verde.',
      },
      problem:
        'Los gastos recurrentes se vuelven invisibles: suscripciones que se acumulan mes a mes sin que nadie las mire.',
      solution:
        'Un tracker nativo para iPhone, bilingüe de fábrica, con recordatorios de cobro y un diseño premium animado que hace que revisar tus gastos deje de ser un trámite.',
      stack: ['React Native', 'Expo', 'TypeScript', 'Reanimated'],
      results: [
        'Lista para App Store',
        '186 tests automatizados en verde',
        'Bilingüe es/en de fábrica',
      ],
      services: ['apps'],
      image: '/images/projects/pulso.png',
    },

    'bot-ime': {
      id: 'bot-ime',
      slug: 'bot-ime',
      name: 'Asistente médico por WhatsApp',
      tagline: 'El recepcionista que nunca se toma un día.',
      seo: {
        title: 'Asistente médico por WhatsApp — caso real | GalfreDev',
        description:
          'Caso real: bot con IA para un instituto médico cordobés que responde 24/7 por 33 profesionales y deriva turnos al canal correcto.',
      },
      problem:
        'En un instituto médico cordobés, las consultas repetitivas por turnos, estudios y coseguros desbordaban al personal todos los días.',
      solution:
        'Un bot de WhatsApp con IA que responde 24/7 sobre 33 profesionales y los coseguros de cada estudio, deriva los turnos al canal correcto y se administra desde un panel de gestión propio. Deployado y atendiendo todos los días.',
      stack: ['Node.js', 'PostgreSQL', 'Redis', 'Claude', 'WhatsApp Cloud API', 'Docker'],
      results: [
        'En producción atendiendo 24/7',
        'Responde por 33 profesionales y sus coseguros',
        'Deriva turnos al canal correcto sin dar datos médicos',
      ],
      services: ['bots-whatsapp', 'automatizaciones-ia'],
      image: '/images/projects/bot-ime.png',
    },

    orbita: {
      id: 'orbita',
      slug: 'orbita',
      name: 'Órbita',
      tagline: 'Tus redes, en piloto automático.',
      seo: {
        title: 'Órbita — orquestador de redes sociales con IA | GalfreDev',
        description:
          'Caso real: plataforma que genera y agenda contenido con IA para varias empresas y redes desde un solo panel, partiendo de noticias reales.',
      },
      problem:
        'Publicar todos los días en varias redes, para varias empresas, consume horas de trabajo creativo y operativo que nadie tiene.',
      solution:
        'Una plataforma que genera posts con IA — texto e imagen — a partir de fuentes de noticias reales, y los agenda en múltiples redes para múltiples marcas desde un solo panel.',
      stack: ['TypeScript', 'Next.js', 'Vercel', 'Railway', 'IA generativa'],
      results: [
        'Live en producción',
        'Genera placas e imágenes con IA por marca',
        'Multi-empresa y multi-red desde un panel',
      ],
      services: ['automatizaciones-ia', 'webs'],
      image: '/images/projects/orbita.png',
    },
  },

  about: {
    seo: {
      title: 'Valentino Galfré — desarrollador de software | GalfreDev',
      description:
        'Quién está detrás de GalfreDev: Valentino Galfré, estudiante de Ingeniería en Sistemas y desarrollador. De la idea a producción, desde Córdoba.',
    },
    title: 'Del código al negocio',
    story: [
      'Soy Valentino Galfré, desarrollador de software de Córdoba, Argentina. Estudio Ingeniería en Sistemas de Información en la UTN FRC, pero mi verdadera escuela es construir: convierto ideas en software que funciona en producción, para negocios reales.',
      'Me formé también en Coderhouse: AI Automation en 2026, Python en 2024, inglés avanzado para desarrollo en 2023, y hoy estoy cursando Backend Developer. Aprendo rápido y construyendo: cada proyecto sube la vara del siguiente.',
      'Lo que me mueve es simple: no soporto ver negocios perdiendo tiempo y plata en tareas que una máquina hace mejor. Por eso me enfoqué en automatización e IA aplicada — no como palabra de moda, sino como herramienta concreta para que una operación funcione sola.',
      'Trabajo de punta a punta: entiendo el problema, diseño la solución, la construyo y la dejo funcionando en producción. Sin intermediarios ni traducciones perdidas entre el que habla con el cliente y el que programa. Hablás conmigo, y el que construye soy yo.',
    ],
    stackGroups: [
      {
        label: 'Backend y datos',
        items: ['Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Supabase'],
      },
      {
        label: 'Frontend y experiencia',
        items: ['Next.js', 'React Native', 'Framer Motion', 'Tailwind CSS', 'SEO técnico'],
      },
      {
        label: 'Automatización e IA',
        items: ['APIs', 'Bots', 'Integraciones', 'Workflows', 'IA aplicada'],
      },
    ],
    certifications: [
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
    ],
  },
}
