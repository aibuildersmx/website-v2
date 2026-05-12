export interface PartnerLogo {
    src: string
    alt: string
    name: string
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

export const ENTERPRISE_PARTNER_LOGOS: PartnerLogo[] = [
    PARTNER_LOGOS.bbva,
    PARTNER_LOGOS.walmart,
    PARTNER_LOGOS.pwc,
    PARTNER_LOGOS.rappi,
    PARTNER_LOGOS['grupo-gigante'],
]
