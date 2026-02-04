'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export const PhotosHeader = () => {
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
                    ? "bg-white/80 dark:bg-black/80 backdrop-blur-xl border-black/10 dark:border-white/10 shadow-2xl shadow-black/10 dark:shadow-black/20" 
                    : "bg-white/50 dark:bg-black/50 backdrop-blur-md border-black/5 dark:border-white/5 shadow-lg"
            )}>
                <Link
                    href="/"
                    aria-label="home"
                    className="flex items-center justify-center h-9 sm:h-10 px-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                >
                    <img 
                        src="/AIBM-logo-dark.svg"
                        alt="AI Builders Mexico" 
                        className="h-4 sm:h-5 w-auto invert dark:invert-0" 
                    />
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Button
                        asChild
                        size="sm"
                        className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-4 sm:px-6 font-mono text-[10px] sm:text-xs uppercase tracking-widest h-9 sm:h-10"
                    >
                        <Link href="/">
                            Regresar
                        </Link>
                    </Button>
                </div>
            </nav>
        </header>
    )
}
