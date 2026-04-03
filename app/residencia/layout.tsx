import React from 'react'
import type { Metadata } from 'next'

import ResidencyFooter from '@/app/residencia/components/footer'
import { ResidencyHeader } from '@/app/residencia/components/header'

export const metadata: Metadata = {
    title: 'La Residencia — AI Builders MX',
    description:
        '6 semanas de coworking gratis en Haab para builders excepcionales. Oficina privada 24/7, apoyo de AIBM y acceso a mentores, partners y posibles credits.',
    icons: {
        icon: [
            {
                url: '/icon-light-32x32.png',
                media: '(prefers-color-scheme: light)',
            },
            {
                url: '/icon-dark-32x32.png',
                media: '(prefers-color-scheme: dark)',
            },
            {
                url: '/icon.svg',
                type: 'image/svg+xml',
            },
        ],
        apple: '/apple-icon.png',
    },
}

export default function ResidencyLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="min-h-screen bg-[#f0f4f8] text-[#1a2a3a]">
            <ResidencyHeader />
            {children}
            <ResidencyFooter />
        </div>
    )
}
