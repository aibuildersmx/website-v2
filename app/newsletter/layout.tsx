import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Newsletter — AI Builders Mexico',
    description:
        'Las mejores actualizaciones de IA, cada semana. Updates, eventos, comunidad y ofertas de trabajo en el ecosistema de IA en México.',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
    },
    openGraph: {
        title: 'Newsletter — AI Builders Mexico',
        description: 'Las mejores actualizaciones de IA, cada semana.',
        type: 'website',
        locale: 'es_MX',
        siteName: 'AI Builders Mexico',
    },
}

export default function NewsletterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>
}
