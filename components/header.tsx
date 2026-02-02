'use client'
import Link from 'next/link'
import { LogoIcon } from '@/components/logo'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Linkedin } from 'lucide-react'

const menuItems = [
    { name: 'Manifesto', href: '#manifesto' },
    { name: 'Events', href: '#events' },
    { name: 'Team', href: '#team' },
]

export const HeroHeader = () => {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header className="fixed top-4 sm:top-6 inset-x-0 z-[100] flex justify-center pointer-events-none px-3 sm:px-6">
            <nav className={cn(
                "pointer-events-auto flex items-center justify-between p-1.5 sm:p-2 rounded-full border transition-all duration-500 ease-in-out w-full max-w-6xl",
                scrolled 
                    ? "bg-black/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20" 
                    : "bg-black/50 backdrop-blur-md border-white/5 shadow-lg"
            )}>
                <Link
                    href="/"
                    aria-label="home"
                    className="flex items-center justify-center h-9 sm:h-10 px-2 rounded-full hover:bg-white/10 transition-colors"
                >
                    <img 
                        src="/AIBM-logo-dark.svg" 
                        alt="AI Builders Mexico" 
                        className="h-4 sm:h-5 w-auto" 
                    />
                </Link>

                <ul className="hidden sm:flex items-center gap-1">
                    {menuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className="px-5 py-2.5 text-xs font-mono uppercase tracking-widest text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Link
                        href="https://www.linkedin.com/company/aibuildersmexico"
                        target="_blank"
                        className="flex items-center justify-center size-9 sm:size-10 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                        aria-label="LinkedIn"
                    >
                        <Linkedin className="size-3.5 sm:size-4" />
                    </Link>
                    <Button
                        asChild
                        size="sm"
                        className="rounded-full bg-white text-black hover:bg-white/90 px-4 sm:px-6 font-mono text-[10px] sm:text-xs uppercase tracking-widest h-9 sm:h-10"
                    >
                        <Link href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm" target="_blank">
                            Únete
                        </Link>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
