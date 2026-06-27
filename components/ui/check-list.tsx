'use client'

import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type CheckListItem =
    | string
    | ReactNode
    | { title?: ReactNode; description?: ReactNode }

export type CheckListVariant = 'light' | 'dark'

interface CheckListProps {
    items: CheckListItem[]
    variant?: CheckListVariant
    className?: string
}

export function CheckList({ items, variant = 'light', className }: CheckListProps) {
    const isDark = variant === 'dark'

    return (
        <div
            className={cn(
                'rounded-xl border p-5 sm:p-6',
                isDark ? 'border-white/10 bg-white/[0.02]' : 'border-black/10 bg-black/[0.02]',
                className,
            )}
        >
            <ul className={cn('space-y-3 font-sans text-sm', isDark ? 'text-[#bac2de]' : 'text-black/70')}>
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className={cn('shrink-0 mt-0.5', isDark ? 'text-[#a6e3a1]' : 'text-green-600')}>✓</span>
                        <span className="flex-1 min-w-0">{renderItem(item, isDark)}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function renderItem(item: CheckListItem, isDark: boolean): ReactNode {
    if (item === null || item === undefined) return null
    if (typeof item === 'string') return item
    if (
        typeof item === 'object' &&
        !Array.isArray(item) &&
        ('title' in item || 'description' in item) &&
        !('$$typeof' in (item as object))
    ) {
        const { title, description } = item as { title?: ReactNode; description?: ReactNode }
        return (
            <>
                {title ? (
                    <strong className={cn('font-sans font-semibold', isDark ? 'text-[#cdd6f4]' : 'text-black')}>{title}</strong>
                ) : null}
                {title && description ? ' — ' : null}
                {description}
            </>
        )
    }
    return item as ReactNode
}
