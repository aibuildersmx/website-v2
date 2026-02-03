import React from "react"
import type {Metadata} from 'next'
import {Geist, Geist_Mono} from 'next/font/google'
import DitherWrapper from "@/app/collab/components/DitherWrapper";
import FooterSection from "@/app/collab/components/footer";
import {HeroHeader} from "@/app/collab/components/header";

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans"
});
const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono"
});

export const metadata: Metadata = {
    title: 'AI Builders MX - Collab',
    description: 'Lets build together',
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

export default function CollabLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className={`${geist.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-background text-foreground`}>
            <div className='absolute w-full h-screen'>
                <DitherWrapper />
            </div>
            <HeroHeader/>
            {children}
            <FooterSection/>
        </div>
    )
}
