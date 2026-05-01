import React from "react"
import type {Metadata} from 'next'
import FooterSection from "@/app/launch/components/footer"
import {HeroHeader} from "@/components/header"

export const metadata: Metadata = {
    title: 'Launch — AI Builders MX',
    description: 'Programa de 6 semanas para builders que quieren construir y lanzar productos reales. Peer-to-peer, workshops semanales, Demo Day.',
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

export default function LaunchLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="dark min-h-screen bg-black text-white">
            <HeroHeader/>
            {children}
            <FooterSection/>
        </div>
    )
}
