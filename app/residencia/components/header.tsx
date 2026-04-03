'use client'

import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

import { Button } from '@/app/launch/components/ui/button'
import { cn } from '@/lib/utils'

const menuItems = [
    { name: 'Programa', href: '#programa' },
    { name: 'Perfil', href: '#perfil' },
    { name: 'Aplicar', href: '#aplica' },
]

export const ResidencyHeader = () => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollTo = (id: string) => (event: React.MouseEvent) => {
        event.preventDefault()
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <header className="fixed top-4 sm:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-6">
            <nav
                className={cn(
                    'pointer-events-auto flex items-center justify-between p-1.5 sm:p-2 rounded-full border transition-all duration-500 ease-in-out w-full max-w-6xl',
                    scrolled
                        ? 'bg-white/80 backdrop-blur-xl border-[#5a9fd4]/15 shadow-2xl shadow-[#1a2a3a]/10'
                        : 'bg-white/50 backdrop-blur-md border-[#5a9fd4]/10 shadow-lg'
                )}
            >
                <Link
                    href="/"
                    aria-label="home"
                    className="flex items-center justify-center h-9 sm:h-10 px-2 rounded-full hover:bg-[#1a2a3a]/5 transition-colors"
                >
                    <Image
                        src="/AIBM-logo-light-bg.svg"
                        alt="AI Builders Mexico"
                        width={112}
                        height={20}
                        className="h-4 sm:h-5 w-auto"
                    />
                </Link>

                <div className="hidden sm:flex items-center gap-1">
                    {menuItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={scrollTo(item.href.slice(1))}
                            className="text-[#1a2a3a]/60 hover:text-[#1a2a3a] text-[10px] sm:text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-full hover:bg-[#1a2a3a]/5 transition-colors"
                        >
                            {item.name}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                        asChild
                        size="sm"
                        className="rounded-full bg-[#1a2a3a] text-white hover:bg-[#2a3a4a] px-4 sm:px-6 font-mono text-[10px] sm:text-xs uppercase tracking-widest h-9 sm:h-10"
                    >
                        <a href="#aplica" onClick={scrollTo('aplica')}>
                            Aplica ahora
                        </a>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
