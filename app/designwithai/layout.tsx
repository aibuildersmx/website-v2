import React from "react"
import type {Metadata} from 'next'
import {Geist, Geist_Mono, Instrument_Serif} from 'next/font/google'
import {HeroHeader} from "@/app/designwithai/components/header"

const geist = Geist({
    subsets: ["latin"],
    variable: "--font-geist-sans"
});
const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono"
});
const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    variable: "--font-instrument",
    weight: "400"
});

export const metadata: Metadata = {
    title: 'Diseña con AI - AI Builders Mexico',
    description: 'Aprende a diseñar y prototipar con Inteligencia Artificial',
    icons: {
        icon: '/favicon.svg',
        shortcut: '/favicon.svg',
    },
}

export default function DesignWithAILayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} font-sans antialiased min-h-screen bg-white text-black`}>
            <HeroHeader/>
            {children}
        </div>
    )
}
