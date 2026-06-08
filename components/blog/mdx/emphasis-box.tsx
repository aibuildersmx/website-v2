'use client'

import type { ReactNode } from 'react'
import { useBlogTheme } from '@/app/(site)/(blog)/layout'
import { cn } from '@/lib/utils'

export type EmphasisBoxVariant = 'info' | 'warning'

/**
 * Italic emphasis box — a single-paragraph quote/insight inside a tinted
 * card. Reach for it when a Callout feels too heavy (no icon, shorter
 * visual weight) but you still want the reader to linger on one sentence.
 *
 * Example:
 * ```mdx
 * <EmphasisBox variant="warning">
 *   Para acceder a Google Calendar por API siempre necesitas pasar por OAuth.
 * </EmphasisBox>
 * ```
 */
export function EmphasisBox({
    variant = 'warning',
    children,
}: {
    variant?: EmphasisBoxVariant
    children: ReactNode
}) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    const box =
        variant === 'warning'
            ? isDark
                ? 'border-[#f9e2af]/20 bg-[#f9e2af]/5'
                : 'border-amber-200 bg-amber-50'
            : isDark
                ? 'border-white/10 bg-white/[0.02]'
                : 'border-black/10 bg-black/[0.02]'

    return (
        <div className={cn('my-6 rounded-xl border p-5 sm:p-6', box)}>
            <p className={cn('text-sm italic leading-relaxed', isDark ? 'text-[#a6adc8]' : 'text-black/60')}>
                {children}
            </p>
        </div>
    )
}
