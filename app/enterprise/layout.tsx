import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Enterprise — AI Builders Mexico',
    description:
        'Workshops, consultoría, reclutamiento y talks de IA para empresas. La comunidad de IA más grande de México al servicio de tu organización.',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
    },
    openGraph: {
        title: 'Enterprise — AI Builders Mexico',
        description:
            'Workshops, consultoría, reclutamiento y talks de IA para empresas en México.',
        type: 'website',
        locale: 'es_MX',
        siteName: 'AI Builders Mexico',
    },
}

export default function EnterpriseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>
}
