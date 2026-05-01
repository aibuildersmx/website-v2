export const ENTERPRISE_EMAIL = '1996byk@gmail.com'

export const buildMailto = (subject: string): string =>
    `mailto:${ENTERPRISE_EMAIL}?subject=${encodeURIComponent(subject)}`

export interface PartnerLogo {
    src: string         // path under /public, e.g. '/logos/enterprise/bbva.svg'
    alt: string         // brand name, used as fallback text if image fails
    name: string        // mono-uppercase label for text-fallback rendering
}

// Replace any logo whose src points to a placeholder SVG with the same shape.
// Keep `alt` and `name` correct so the text fallback renders cleanly.
// Placeholder SVGs (text-only, no real wordmark): t1, grupo-gigante.
export const PARTNER_LOGOS: Record<string, PartnerLogo> = {
    bbva: { src: '/logos/enterprise/bbva.svg', alt: 'BBVA', name: 'BBVA' },
    walmart: { src: '/logos/enterprise/walmart.svg', alt: 'Walmart', name: 'WALMART' },
    pwc: { src: '/logos/enterprise/pwc.svg', alt: 'PwC', name: 'PWC' },
    rappi: { src: '/logos/enterprise/rappi.svg', alt: 'Rappi', name: 'RAPPI' },
    t1: { src: '/logos/enterprise/t1.svg', alt: 'T1', name: 'T1' },
    'grupo-gigante': { src: '/logos/enterprise/grupo-gigante.svg', alt: 'Grupo Gigante', name: 'GRUPO GIGANTE' },
}

export const HERO_LOGOS: PartnerLogo[] = [
    PARTNER_LOGOS.bbva,
    PARTNER_LOGOS.walmart,
    PARTNER_LOGOS.pwc,
    PARTNER_LOGOS.rappi,
    PARTNER_LOGOS.t1,
    PARTNER_LOGOS['grupo-gigante'],
]

// ----- Section copy -----

export const HERO_COPY = {
    eyebrow: 'PARA EMPRESAS',
    headline: 'Lleva la inteligencia artificial al corazón de tu organización.',
    subhead:
        'Diseñamos workshops, asesoría estratégica, reclutamiento técnico y talks corporativos para equipos que están construyendo con IA en serio.',
    primaryCtaLabel: 'Contáctanos',
    primaryCtaSubject: 'Consulta Enterprise',
    secondaryCtaLabel: 'Ver servicios',
    secondaryCtaHref: '#workshops',
    partnersEyebrow: 'HAN CONFIADO EN NOSOTROS',
}

export const WORKSHOPS_COPY = {
    id: 'workshops',
    eyebrow: 'WORKSHOPS',
    headline: 'Workshops de IA hechos a la medida.',
    body: [
        'Sesiones de 1 a 3 días, presenciales o remotas, diseñadas alrededor de los retos reales que tu equipo enfrenta. Sin slides genéricos.',
        'Trabajamos con líderes, managers y equipos técnicos. Cada workshop combina teoría aplicada, manos en código y un framework concreto para llevar lo aprendido al día a día.',
        'Te entregamos un playbook post-workshop con los flujos y herramientas que tu equipo va a usar después de que nos vayamos.',
    ],
    ctaLabel: 'Solicitar workshop',
    ctaSubject: 'Consulta Enterprise — Workshops',
    mediaSrc: '/images/event-photos/v0/DSC00048.jpg',
    mediaAlt: 'AI Builders workshop in progress',
}

export const CONSULTING_COPY = {
    id: 'consulting',
    eyebrow: 'CONSULTORÍA',
    headline: 'Asesoría estratégica mensual con acceso semanal.',
    pricing: 'Desde $5,000 USD / mes',
    body: [
        'Trabajamos como retainer mensual, no por proyecto ni por hora. Tu equipo de liderazgo recibe acceso directo a los founders de AI Builders cada semana.',
        'Ideal para C-levels y heads of product/engineering que necesitan un partner constante mientras adoptan IA: priorización, arquitectura, contratación y conexiones a la red de builders.',
    ],
    deliverables: [
        { title: '4 sesiones estratégicas / mes', description: 'Acceso directo con los founders' },
        { title: 'WhatsApp directo', description: 'Respuestas en horas, no en semanas' },
        { title: 'Asesoría técnica + estratégica', description: 'Producto, contratación, arquitectura' },
        { title: 'Intros a la red de builders', description: 'Acceso a +3,000 builders en México y EE.UU.' },
    ],
    ctaLabel: 'Agendar conversación',
    ctaSubject: 'Consulta Enterprise — Consultoría',
}

export const RECRUITING_COPY = {
    id: 'recruiting',
    eyebrow: 'RECLUTAMIENTO',
    headline: 'Reclutamiento técnico para equipos de IA.',
    subhead:
        'Acceso a +3,000 builders en México: ML/AI engineers senior, founding engineers y AI product leaders. Cuando publicamos un rol en la red, las mejores postulaciones llegan en días.',
    cards: [
        {
            title: 'Sourcing',
            description:
                'Tapamos en la comunidad y en la red curada. No CVs spam — perfiles que ya tienen contexto en el ecosistema de IA.',
        },
        {
            title: 'Screening',
            description:
                'Filtros técnicos y de cultura antes de que tu equipo invierta tiempo. Te llegan finalistas, no candidatos.',
        },
        {
            title: 'Placement',
            description:
                'Acompañamos el cierre y los primeros 30 días. Si no funciona, lo arreglamos con prioridad.',
        },
    ],
    ctaLabel: 'Empezar búsqueda',
    ctaSubject: 'Consulta Enterprise — Reclutamiento',
}

export const TALKS_COPY = {
    id: 'talks',
    eyebrow: 'TALKS Y ENGAGEMENT',
    headline: 'Talks y engagement corporativo.',
    body: [
        'Keynotes, paneles y sesiones de AI literacy para boards y equipos de liderazgo. Llevamos la conversación de IA del hype a las decisiones reales que tu organización tiene que tomar este año.',
        'Tres temas que pedimos seguido: estrategia de IA para líderes no técnicos, el panorama de talento de IA en México, y ética + gobernanza para equipos en escala.',
    ],
    topics: [
        'Estrategia de IA para líderes',
        'Talento e IA en México',
        'Ética y gobernanza',
    ],
    ctaLabel: 'Invitar a hablar',
    ctaSubject: 'Consulta Enterprise — Talks',
}

export const CTA_COPY = {
    eyebrow: 'LISTOS PARA EMPEZAR',
    headline: 'Hablemos.',
    services: [
        { label: 'Workshops →', subject: WORKSHOPS_COPY.ctaSubject },
        { label: 'Consultoría →', subject: CONSULTING_COPY.ctaSubject },
        { label: 'Reclutamiento →', subject: RECRUITING_COPY.ctaSubject },
        { label: 'Talks →', subject: TALKS_COPY.ctaSubject },
    ],
    newsletterEyebrow: 'NEWSLETTER',
    newsletterHeadline: 'Recibe updates semanales.',
    newsletterBody:
        'Herramientas, papers, eventos y vacantes del ecosistema de IA en México. Sin spam, solo valor.',
    newsletterProof: 'Únete a +1,000 builders hoy',
}
