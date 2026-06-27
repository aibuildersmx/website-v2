import React from 'react'
import type { Metadata } from 'next'

import ResidencyFooter from '@/app/(site)/residencia/components/footer'
import { HeroHeader } from '@/components/header'

export const metadata: Metadata = {
    title: 'La Residencia — AI Builders MX',
    description:
        '6 semanas de coworking gratis en Haab para builders excepcionales, apoyo de AIBM, acceso a mentores y partners, y un Digital Track para un cohorte pequeño.',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
    },
}

export default function ResidencyLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="min-h-screen bg-white text-black">
            <HeroHeader />
            {children}
            <ResidencyFooter />
        </div>
    )
}
