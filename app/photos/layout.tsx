import React from "react"
import type { Metadata } from 'next'
import { PhotosHeader } from "./components/header"

export const metadata: Metadata = {
    title: 'AI Builders MX - Fotos',
    description: 'Fotos de eventos de AI Builders Mexico',
}

export default function PhotosLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <PhotosHeader />
            {children}
        </div>
    )
}
