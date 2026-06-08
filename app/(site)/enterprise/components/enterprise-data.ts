import { BUILDER_COUNT_FORMATTED } from '@/lib/constants'
import { ENTERPRISE_PARTNER_LOGOS, PARTNER_LOGOS, type PartnerLogo } from '@/lib/enterprise-partners'

export const ENTERPRISE_EMAIL = '1996byk@gmail.com'

export const buildMailto = (subject: string): string =>
    `mailto:${ENTERPRISE_EMAIL}?subject=${encodeURIComponent(subject)}`

export { PARTNER_LOGOS, type PartnerLogo }

export const HERO_LOGOS: PartnerLogo[] = ENTERPRISE_PARTNER_LOGOS

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
    eyebrow: '01 / WORKSHOPS CORPORATIVOS DE IA, HECHOS A LA MEDIDA',
    headline: 'Workshops',
    body: [
        'Sesiones de 1 a 3 días, presenciales o remotas, diseñadas alrededor de los retos reales que tu equipo enfrenta. Sin slides genéricos.',
        'Trabajamos con líderes, managers y equipos técnicos. Cada workshop combina teoría aplicada, manos en código y un framework concreto para llevar lo aprendido al día a día.',
        'Te entregamos un playbook post-workshop con los flujos y herramientas que tu equipo va a usar después de que nos vayamos.',
    ],
    tools: [
        { title: 'Claude Code', description: 'agentes para código real.' },
        { title: 'Cursor', description: 'programación asistida.' },
        { title: 'GPT Enterprise', description: 'flujos seguros para equipos.' },
    ],
    outcomes: [
        { title: 'Flujos adoptables', description: 'listos para usar.' },
        { title: 'Prototipos funcionales', description: 'sobre retos reales.' },
        { title: 'Criterios claros', description: 'qué automatizar y medir.' },
    ],
    ctaLabel: 'Solicitar workshop',
    ctaSubject: 'Consulta Enterprise — Workshops',
    mediaSrc: '/images/event-photos/v0/DSC00048.jpg',
    mediaAlt: 'AI Builders workshop in progress',
}

export const CONSULTING_COPY = {
    id: 'consulting',
    eyebrow: '02 / ASESORÍA ESTRATÉGICA MENSUAL CON ACCESO SEMANAL',
    headline: 'Consultoría',
    pricing: 'Desde $5,000 USD / mes',
    body: [
        'Trabajamos con pocos partners a la vez. Solo tomamos equipos con la flexibilidad, urgencia y sponsorship interno para transformar con IA de forma real.',
        'El modelo es un retainer mensual con acceso semanal a los founders de AI Builders: priorización, arquitectura, contratación y conexiones a la red de builders.',
    ],
    deliverables: [
        { title: '4 sesiones estratégicas / mes', description: 'Acceso directo con los founders' },
        { title: 'WhatsApp directo', description: 'Respuestas en horas, no en semanas' },
        { title: 'Asesoría técnica + estratégica', description: 'Producto, contratación, arquitectura' },
        { title: 'Intros a la red de builders', description: `Acceso a +${BUILDER_COUNT_FORMATTED} builders en México y EE.UU.` },
    ],
    ctaLabel: 'Ver si somos fit',
    ctaSubject: 'Consulta Enterprise — Consultoría',
}

export const RECRUITING_COPY = {
    id: 'recruiting',
    eyebrow: '03 / RECLUTAMIENTO TÉCNICO PARA EQUIPOS DE IA',
    headline: 'Reclutamiento',
    subhead:
        `Acceso a +${BUILDER_COUNT_FORMATTED} builders en México: ML/AI engineers senior, founding engineers y AI product leaders. Cuando publicamos un rol en la red, las mejores postulaciones llegan en días.`,
    cards: [
        {
            title: 'Sourcing',
            description:
                'Activamos la comunidad y nuestra red curada. No CVs spam — perfiles que ya tienen contexto en el ecosistema de IA.',
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
    eyebrow: '04 / TALKS Y ENGAGEMENT CORPORATIVO',
    headline: 'Talks y engagement',
    body: [
        'Keynotes, paneles y sesiones de AI literacy para boards y equipos de liderazgo. Llevamos la conversación de IA del hype a las decisiones reales que tu organización tiene que tomar este año.',
        'Tres temas que pedimos seguido: estrategia de IA para líderes no técnicos, el panorama de talento de IA en México, y prácticas avanzadas de ingeniería para apalancar IA.',
    ],
    topics: [
        'Estrategia de IA para líderes',
        'Talento e IA en México',
        'Prácticas avanzadas de ingeniería para apalancar IA',
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
    contactEyebrow: 'CONTACTO',
    contactHeadline: 'Acelera la transformación digital con IA en tu organización.',
    contactBody: '',
    contactCtaLabel: 'Contáctanos',
    contactCtaSubject: 'Consulta Enterprise',
}
