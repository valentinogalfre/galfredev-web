import type { Dictionary } from '@/types/content'

export const en: Dictionary = {
  common: {
    brand: 'GalfreDev',
    nav: [
      { label: 'Services', href: '/#services' },
      { label: 'Projects', href: '/projects' },
      { label: 'Process', href: '/#process' },
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/#contact' },
    ],
    localeSwitch: 'ES',
    ctaTalk: "Let's talk",
    footer: {
      rights: 'All rights reserved.',
      madeIn: 'Built in Córdoba, Argentina.',
    },
    whatsappBaseMessage: "Hi! I'd like to ask about GalfreDev's services.",
    commandPalette: {
      placeholder: 'Search pages, services, projects…',
      groups: { pages: 'Pages', actions: 'Actions' },
    },
    notFound: {
      title: "This page doesn't exist (yet).",
      back: 'Back home',
    },
  },

  home: {
    seo: {
      title: 'GalfreDev | Custom Software, WhatsApp Bots & Applied AI',
      description:
        'I build websites, apps, WhatsApp bots, automation and applied AI for businesses. Custom software working 24/7. Córdoba, Argentina.',
    },
    hero: {
      eyebrow: 'CÓRDOBA, ARGENTINA — AVAILABLE FOR PROJECTS',
      titlePrefix: 'Software that',
      // Widest FIRST: rotating words re-emit LCP candidates when the painted h1
      // area grows — leading with the longest keeps LCP pinned to first paint.
      rotatingWords: ['sells for you.', 'never sleeps.', 'answers 24/7.'],
      sub: 'WhatsApp bots, websites, apps and applied AI. Custom-built, working around the clock for your business.',
      ctaPrimary: { label: 'Start a project', href: '#contact' },
      ctaSecondary: { label: 'See projects', href: '/projects' },
      typedWords: ['WHATSAPP', 'APPS', 'WEBSITES', 'AI', 'AUTOMATE'],
      soundOn: 'Enable keyboard sound',
      soundOff: 'Mute keyboard',
      eggMessage: "> access granted. you're one of us.",
    },
    services: {
      title: 'What I build',
      sub: 'Five ways to make your business run on its own.',
    },
    projects: {
      title: 'Real cases',
      sub: 'Software in production, used every day.',
    },
    botDemo: {
      title: 'Try it yourself',
      sub: 'This bot is real: ask it anything about my services. This is how it would treat your customers.',
      inputPlaceholder: 'Message the bot…',
      limitNote: "Limited demo per visitor. For the full version, let's talk.",
    },
    process: {
      title: 'How I work',
      steps: [
        {
          title: 'Business diagnosis',
          description:
            'We pinpoint where time, control or revenue is leaking and what to tackle first.',
          outcome: 'A real problem defined, with clear priority and impact.',
        },
        {
          title: 'Focused implementation',
          description:
            'We build the solution with just the right level of automation, integration or software.',
          outcome: 'Up and running fast, and operationally sound.',
        },
        {
          title: 'Tuning and continuous improvement',
          description:
            'We measure what worked, remove real friction and define the next useful step.',
          outcome: 'The solution keeps pace with your growth instead of freezing.',
        },
      ],
    },
    roi: {
      title: "What's the return?",
      sub: 'Calculate the return of automating your operation.',
      eyebrow: 'ROI calculator',
      calculator: {
        salary: {
          label: 'Monthly cost of the resource',
          help: 'Enter the monthly cost of the employee or resource doing those tasks today.',
        },
        hours: {
          label: 'Weekly hours on repetitive tasks',
          help: 'Adjust how many hours a week get eaten by tasks we could automate.',
          unit: 'hrs',
          min: '1 hr',
          max: '40 hrs',
        },
        costNote: {
          before: 'Right now those repetitive hours are costing you roughly',
          after: 'per month.',
        },
        chart: {
          title: '12-month savings projection',
          sub: 'It compounds month after month based on the current estimated savings.',
          badge: 'Visible ROI',
          ariaLabel: '12-month cumulative savings chart',
        },
        next: {
          kicker: 'Next step',
          before: 'If you automate these tasks, you can win back',
          after: 'a year. Shall we talk?',
          cta: 'I want to automate',
        },
        results: {
          monthly: 'Savings / month',
          hoursFree: 'Hours freed / month',
          annual: 'Annual savings',
        },
        whatsapp: {
          intro: "Hi! I used GalfreDev's ROI calculator.",
          salary: 'Monthly cost of the resource:',
          hours: 'Weekly hours on repetitive tasks:',
          monthly: 'Estimated monthly savings:',
          annual: 'Projected annual savings:',
          closing: 'I want to automate these tasks.',
        },
      },
    },
    about: {
      title: "Who's behind this",
      teaser:
        "I'm Valentino Galfré: an Information Systems Engineering student and developer. I build real software for real businesses — from idea to production.",
      cta: { label: 'Get to know my story', href: '/about' },
    },
    contact: {
      title: "Let's talk",
      sub: 'Tell me your idea or your problem. I reply the same day.',
      intro:
        'The site handles the first step: showing what GalfreDev does, giving you context and letting you request a diagnosis or a proposal clearly. The ideal close is a real conversation.',
      whatsappCta: 'Chat on WhatsApp',
      whatsappMessage:
        "Hi! I'd like to talk on WhatsApp about automation or custom software.",
      formNote:
        'You can also leave your details and main need so the conversation starts with better context, priority and explicit consent.',
      form: {
        fields: {
          fullName: { label: 'Full name', placeholder: 'What should I call you' },
          email: { label: 'Email', placeholder: 'you@email.com' },
          phone: {
            label: 'WhatsApp',
            placeholder: '+1 555...',
            helper: 'We use it to follow up on your enquiry without friction.',
          },
          company: {
            label: 'Business or company',
            placeholder: 'Business or brand name',
          },
          businessType: {
            label: 'Industry',
            placeholder: 'Design, health, services, e-commerce...',
          },
          primaryNeed: {
            label: 'Main need',
            placeholder: 'Pick an option',
            options: [
              { value: 'whatsapp', label: 'WhatsApp & lead capture' },
              { value: 'seguimiento', label: 'Sales follow-up' },
              { value: 'turnos', label: 'Bookings & reminders' },
              { value: 'cobranzas', label: 'Collections & notices' },
              { value: 'automatizacion-interna', label: 'Internal automation' },
              { value: 'software-a-medida', label: 'Custom software' },
            ],
          },
          challenge: {
            label: 'Tell me the context',
            placeholder:
              "What's happening today, what you want to sort out and the result you expect.",
            helper:
              'The clearer the context, the better prepared the WhatsApp message comes out.',
          },
        },
        consent: {
          followUp: 'I authorize commercial follow-up by email or WhatsApp.',
          newsletter:
            'I want to receive news about automation, software and applied AI.',
          privacy:
            'I accept the privacy policy and the processing of my data for this contact.',
        },
        submit: { idle: 'Request a proposal or diagnosis', loading: 'Sending...' },
        whatsappDirect: 'Go straight to WhatsApp',
        validation: {
          fullNameRequired: 'We need your name to log the enquiry.',
          fullNameTooLong: 'Use a slightly shorter name.',
          emailRequired: 'We need an email to get back to you.',
          emailInvalid: 'Enter a valid email.',
          emailTooLong: 'That email is too long.',
          phoneRequired: 'We need a WhatsApp number to follow up.',
          phoneInvalid: 'Enter a valid WhatsApp number.',
          phoneReview: 'Double-check the WhatsApp number before sending it.',
          companyTooLong: 'The company name is too long.',
          businessTypeTooLong: 'The industry is too long.',
          primaryNeedRequired: 'Pick your main need.',
          primaryNeedInvalid: 'Pick a valid main need.',
          challengeRequired: 'Tell us the context so we can prepare a better proposal.',
          challengeTooShort: 'Give us a bit more context to understand the enquiry.',
          challengeTooLong: 'Trim the context a little so we can review it properly.',
          consentPrivacyRequired: 'We need your privacy consent to store this lead.',
        },
        messages: {
          validationSummary: 'Check the highlighted fields before sending your enquiry.',
          success: "Your enquiry is in. We're taking you to WhatsApp to continue.",
          successCta: 'Continue on WhatsApp now',
          connectionError:
            "We couldn't send your enquiry due to a connection issue. Try again or message us on WhatsApp.",
          serverError: "We couldn't log your enquiry right now. Please try again.",
        },
      },
    },
  },

  services: {
    'bots-whatsapp': {
      id: 'bots-whatsapp',
      slug: 'whatsapp-bots',
      name: 'WhatsApp Bots',
      seo: {
        title: 'WhatsApp Bots for Business | GalfreDev',
        description:
          'AI-powered WhatsApp bots that answer customers, qualify leads and book appointments 24/7. Custom-built in Argentina, running in production.',
      },
      hero: {
        eyebrow: 'WHATSAPP BOTS',
        title: 'Leads that',
        italic: 'never go cold.',
        sub: 'Your business gets messages at all hours. An AI bot answers them instantly, filters out the noise and hands you customers ready to buy.',
      },
      benefits: [
        {
          title: 'Instant replies, around the clock',
          detail:
            'Every message gets answered in seconds — at 3 pm or 3 am. Nobody walks away because they were left on read.',
        },
        {
          title: 'Qualified leads, not noise',
          detail:
            'The bot asks the right questions and surfaces only the people with real intent to buy or book.',
        },
        {
          title: 'Bookings without the back-and-forth',
          detail:
            'Appointments get scheduled inside the same conversation, with no endless message chains.',
        },
        {
          title: 'Sounds like your business',
          detail:
            'Trained on your real information: prices, hours, services. It answers in your voice, not like a generic robot.',
        },
      ],
      demoTitle: 'Try a real bot',
      demoHint:
        'Message it like a customer would: ask about prices, hours or services and watch how it answers.',
      relatedProjects: ['bot-ime', 'pyron'],
      whatsappMessage: "Hi! I'd like to ask about a WhatsApp bot for my business.",
    },

    webs: {
      id: 'webs',
      slug: 'websites',
      name: 'Websites',
      seo: {
        title: 'Website Design & Development | GalfreDev',
        description:
          'Fast, animated, SEO-ready websites that turn visitors into customers. Custom design and development from Córdoba, Argentina.',
      },
      hero: {
        eyebrow: 'WEBSITES',
        title: 'A website that',
        italic: 'sells on its own.',
        sub: 'Fast, animated and built to rank on Google. The site you are looking at right now is the best demo of how I work.',
      },
      benefits: [
        {
          title: 'A first impression that lands',
          detail:
            'Modern design with fluid animations that builds trust within the first three seconds.',
        },
        {
          title: 'Google finds you',
          detail:
            'Technical SEO baked into the code: structure, speed and content built to rank without paying for ads.',
        },
        {
          title: 'Fast on any phone',
          detail:
            'Optimized to load instantly on the oldest phone with the worst signal. That is where your customers are.',
        },
        {
          title: 'Built to convert',
          detail:
            'Every section pushes toward one concrete action: inquire, buy, book. Nothing decorative for its own sake.',
        },
      ],
      demoTitle: 'This site is the demo',
      demoHint:
        'Look around: the animations, the speed and the 3D keyboard on the home page are the level of detail every build gets.',
      relatedProjects: ['orbita'],
      whatsappMessage: "Hi! I'd like to ask about a website for my business.",
    },

    apps: {
      id: 'apps',
      slug: 'apps',
      name: 'Apps',
      seo: {
        title: 'iOS, Android & Web App Development | GalfreDev',
        description:
          'Custom mobile apps and web systems that get your operation out of spreadsheets and paper. Professional development from Córdoba, Argentina.',
      },
      hero: {
        eyebrow: 'APPS',
        title: 'Your operation,',
        italic: 'in one app.',
        sub: 'iOS and Android apps and web systems that replace spreadsheets, paper and notebooks with an operation you can actually see.',
      },
      benefits: [
        {
          title: 'Goodbye, spreadsheets',
          detail:
            'Everything that lives in Excel and sticky notes moves into one central system that never gets lost or overwritten.',
        },
        {
          title: 'Real-time visibility',
          detail:
            'Know what is happening in your business right now, from your phone, without calling anyone to ask.',
        },
        {
          title: 'Designed for your team',
          detail:
            'Simple screens anyone learns in minutes. An app your team refuses to use is worthless — so I design it around them.',
        },
        {
          title: 'Grows with you',
          detail:
            'An architecture built to add features without starting over: bookings today, invoicing tomorrow, reports next.',
        },
      ],
      demoTitle: 'See it in action',
      demoHint:
        'Play with the interactive demo and feel what a custom-built app is like, polished down to the last detail.',
      relatedProjects: ['pulso', 'pyron'],
      whatsappMessage: "Hi! I'd like to ask about building an app.",
    },

    'automatizaciones-ia': {
      id: 'automatizaciones-ia',
      slug: 'ai-automation',
      name: 'AI & Automation',
      seo: {
        title: 'AI & Business Automation Services | GalfreDev',
        description:
          'Workflows that connect your tools, plus AI applied to real tasks: less manual work, fewer errors, more time for what actually makes money.',
      },
      hero: {
        eyebrow: 'AI & AUTOMATION',
        title: 'Repetitive work,',
        italic: 'gone for good.',
        sub: 'I connect your tools to each other and add AI where it truly pays off. What you do by hand today runs on its own tomorrow.',
      },
      benefits: [
        {
          title: 'Enter data once',
          detail:
            'Your systems talk to each other: whatever comes in on one side shows up where it belongs, no copy-paste.',
        },
        {
          title: 'AI where it pays, not where it trends',
          detail:
            'Writing, classification, content generation: I apply AI to concrete tasks with measurable results.',
        },
        {
          title: 'Fewer human errors',
          detail: 'Automated processes never forget, never get tired and never mistype.',
        },
        {
          title: 'Hours back every week',
          detail:
            'Repetitive tasks stop draining your team, and that time goes back into what makes money.',
        },
      ],
      demoTitle: 'Watch it run',
      demoHint:
        'Try the interactive demo and see how an automated workflow turns hours of work into seconds.',
      relatedProjects: ['orbita', 'bot-ime'],
      whatsappMessage: "Hi! I'd like to ask about automation and AI for my business.",
    },

    'software-a-medida': {
      id: 'software-a-medida',
      slug: 'custom-software',
      name: 'Custom Software',
      seo: {
        title: 'Custom Software Development for Companies | GalfreDev',
        description:
          'Complete custom-built systems: backend, admin panel and electronic invoicing. For when off-the-shelf software is not enough.',
      },
      hero: {
        eyebrow: 'CUSTOM SOFTWARE',
        title: 'When off-the-shelf',
        italic: 'is not enough.',
        sub: 'When generic software falls short, I build the full system: backend, admin panel, even electronic invoicing.',
      },
      benefits: [
        {
          title: 'Everything in one system',
          detail:
            'Work orders, customers, stock, invoicing: one source of truth instead of five disconnected tools.',
        },
        {
          title: 'Adapts to how you work',
          detail:
            'You stop bending your operation to what boxed software allows: the system is built around your processes.',
        },
        {
          title: 'Invoicing and paperwork handled',
          detail:
            'Tax integration, receipts and reports: the administrative side is solved inside the same system.',
        },
        {
          title: 'Evolves with your company',
          detail:
            'It starts by solving the urgent part and grows module by module, with no painful migrations and no starting over.',
        },
      ],
      demoTitle: 'Explore a real system',
      demoHint:
        'Use the interactive demo to walk through a custom system from the inside: panels, flows and live data.',
      relatedProjects: ['pyron'],
      whatsappMessage: "Hi! I'd like to ask about custom software for my company.",
    },
  },

  projects: {
    pyron: {
      id: 'pyron',
      slug: 'pyron',
      name: 'Pyron',
      tagline: 'The system that runs fire extinguisher companies end to end.',
      seo: {
        title: 'Pyron — Management SaaS for Fire Extinguisher Companies | GalfreDev',
        description:
          'Real case: complete system with work orders, real electronic invoicing, publicly verifiable QR tags and a WhatsApp bot.',
      },
      problem:
        'Fire extinguisher companies run a regulated operation — recharges, expirations, traceability — on spreadsheets and paper that neither scale nor survive an audit.',
      solution:
        'A complete custom-built system: work orders, real AFIP electronic invoicing (tax-authority-approved), QR tags anyone can verify publicly, a WhatsApp bot and a PWA with scanning and OCR for field work.',
      stack: ['Next.js', 'tRPC', 'PostgreSQL', 'Railway', 'Vercel', 'Claude'],
      results: [
        'In production with real customers invoicing',
        'AFIP electronic invoicing issuing real CAE approvals',
        'QR tags anyone can verify publicly',
      ],
      services: ['software-a-medida', 'apps', 'automatizaciones-ia'],
      image: '/images/projects/pyron.png',
    },

    pulso: {
      id: 'pulso',
      slug: 'pulso',
      name: 'Pulso',
      tagline: 'Your subscriptions, under control and in plain sight.',
      seo: {
        title: 'Pulso — iOS Subscription Tracker App | GalfreDev',
        description:
          'Real case: native iPhone app that puts your recurring spending in plain sight, with reminders, a premium animated design and 186 tests passing.',
      },
      problem:
        'Recurring charges turn invisible: subscriptions pile up month after month with nobody watching.',
      solution:
        'A native iPhone tracker, bilingual out of the box, with billing reminders and a premium animated design that makes checking your spending stop feeling like a chore.',
      stack: ['React Native', 'Expo', 'TypeScript', 'Reanimated'],
      results: [
        'Ready for the App Store',
        '186 automated tests passing',
        'Bilingual es/en out of the box',
      ],
      services: ['apps'],
      image: '/images/projects/pulso.png',
    },

    'bot-ime': {
      id: 'bot-ime',
      slug: 'bot-ime',
      name: 'Medical WhatsApp Assistant',
      tagline: 'The receptionist that never takes a day off.',
      seo: {
        title: 'Medical WhatsApp Assistant — Real Case | GalfreDev',
        description:
          'Real case: AI bot for a medical institute in Córdoba that answers 24/7 about 33 practitioners and routes appointments to the right channel.',
      },
      problem:
        'At a medical institute in Córdoba, repetitive questions about appointments, tests and copays overwhelmed the staff every single day.',
      solution:
        'An AI-powered WhatsApp bot that answers 24/7 about 33 practitioners and the copay coverage of each test, routes appointment requests to the right channel and is managed from its own admin panel. Deployed and answering every day.',
      stack: ['Node.js', 'PostgreSQL', 'Redis', 'Claude', 'WhatsApp Cloud API', 'Docker'],
      results: [
        'In production answering 24/7',
        'Covers 33 practitioners and their copays',
        'Routes appointments to the right channel without sharing medical data',
      ],
      services: ['bots-whatsapp', 'automatizaciones-ia'],
      image: '/images/projects/bot-ime.png',
    },

    orbita: {
      id: 'orbita',
      slug: 'orbita',
      name: 'Órbita',
      tagline: 'Your social media, on autopilot.',
      seo: {
        title: 'Órbita — AI Social Media Orchestrator | GalfreDev',
        description:
          'Real case: platform that generates and schedules AI content for several companies and networks from one panel, starting from real news.',
      },
      problem:
        'Posting daily across several networks, for several companies, burns hours of creative and operational work nobody has.',
      solution:
        'A platform that generates posts with AI — copy and imagery — from real news sources, and schedules them across multiple networks for multiple brands from a single panel.',
      stack: ['TypeScript', 'Next.js', 'Vercel', 'Railway', 'Generative AI'],
      results: [
        'Live in production',
        'Generates branded graphics and images with AI',
        'Multi-company and multi-network from one panel',
      ],
      services: ['automatizaciones-ia', 'webs'],
      image: '/images/projects/orbita.png',
    },
  },

  about: {
    seo: {
      title: 'Valentino Galfré — Software Developer | GalfreDev',
      description:
        'The person behind GalfreDev: Valentino Galfré, Information Systems Engineering student and developer. From idea to production, from Córdoba.',
    },
    title: 'From code to business',
    story: [
      "I'm Valentino Galfré, a software developer from Córdoba, Argentina. I study Information Systems Engineering at UTN FRC, but my real school is building: I turn ideas into software that runs in production, for real businesses.",
      "I also trained at Coderhouse: AI Automation in 2026, Python in 2024, advanced English for development in 2023, and I'm currently taking their Backend Developer course. I learn fast and by building — every project raises the bar for the next one.",
      "What drives me is simple: I can't stand watching businesses lose time and money on tasks a machine does better. That's why I focused on automation and applied AI — not as a buzzword, but as a concrete tool to make an operation run on its own.",
      "I work end to end: I understand the problem, design the solution, build it and leave it running in production. No middlemen, nothing lost in translation between the person who talks to the client and the person who codes. You talk to me, and I'm the one who builds.",
    ],
    stackGroups: [
      {
        label: 'Backend & data',
        items: ['Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'Supabase'],
      },
      {
        label: 'Frontend & experience',
        items: ['Next.js', 'React Native', 'Framer Motion', 'Tailwind CSS', 'Technical SEO'],
      },
      {
        label: 'Automation & AI',
        items: ['APIs', 'Bots', 'Integrations', 'Workflows', 'Applied AI'],
      },
    ],
    certifications: [
      {
        id: 'ai-automation',
        title: 'AI Automation',
        issuer: 'Coderhouse',
        date: 'January 23, 2026',
        image: '/images/certificates/ai-automation.png',
      },
      {
        id: 'english-advanced',
        title: 'English for Development — Advanced',
        issuer: 'Coderhouse',
        date: 'June 14, 2023',
        image: '/images/certificates/english-advanced.png',
      },
      {
        id: 'python',
        title: 'Python',
        issuer: 'Coderhouse',
        date: 'May 13, 2024',
        image: '/images/certificates/python.png',
      },
    ],
  },
}
