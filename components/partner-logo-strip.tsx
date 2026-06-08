'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { PartnerLogo } from '@/lib/enterprise-partners'

interface PartnerLogoStripProps {
    logos: PartnerLogo[]
    eyebrow?: string
    variant?: 'light' | 'dark'
    size?: 'sm' | 'md'
    className?: string
}

export function PartnerLogoStrip({
    logos,
    eyebrow,
    variant = 'light',
    size = 'md',
    className,
}: PartnerLogoStripProps) {
    const isDark = variant === 'dark'
    const heightClass = size === 'sm' ? 'h-5 sm:h-6' : 'h-6 sm:h-8'

    return (
        <div className={cn('flex flex-col items-center gap-4 sm:gap-6', className)}>
            {eyebrow ? (
                <span
                    className={cn(
                        'text-[10px] sm:text-xs font-mono uppercase tracking-widest',
                        isDark ? 'text-white/40' : 'text-black/40',
                    )}
                >
                    {eyebrow}
                </span>
            ) : null}
            <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-12">
                {logos.map((logo) => (
                    <li key={logo.alt}>
                        <LogoCell logo={logo} variant={variant} heightClass={heightClass} />
                    </li>
                ))}
            </ul>
        </div>
    )
}

function LogoCell({
    logo,
    variant,
    heightClass,
}: {
    logo: PartnerLogo
    variant: 'light' | 'dark'
    heightClass: string
}) {
    const [errored, setErrored] = useState(false)
    const isDark = variant === 'dark'

    if (errored) {
        return (
            <span
                className={cn(
                    'font-mono uppercase tracking-widest text-xs sm:text-sm font-medium',
                    isDark ? 'text-white/60' : 'text-black/60',
                )}
            >
                {logo.name}
            </span>
        )
    }

    return (
        <Image
            src={logo.src}
            alt={logo.alt}
            width={128}
            height={32}
            unoptimized
            className={cn(
                'w-auto object-contain transition-opacity duration-300',
                heightClass,
                isDark ? 'opacity-50 hover:opacity-100 invert' : 'opacity-40 hover:opacity-100 grayscale',
            )}
            onError={() => setErrored(true)}
        />
    )
}
