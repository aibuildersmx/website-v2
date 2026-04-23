'use client'

import type { ReactNode } from 'react'
import { useBlogTheme } from '@/app/(blog)/layout'
import { cn } from '@/lib/utils'

export type TroubleshootItem = {
    error: ReactNode
    fix: ReactNode
}

/**
 * Error → fix pair stack. Top line is mono red (the error message or code),
 * second line is the human-readable resolution.
 *
 * Use for "troubleshooting" / "common errors" sections. For a single
 * error-vs-fix pair, prefer <Callout type="warning">.
 *
 * Example:
 * ```mdx
 * <TroubleshootList items={[
 *   { error: 'Access blocked', fix: 'Add your account as a test user.' },
 *   { error: 'accessNotConfigured', fix: 'Enable the API in Cloud Console.' },
 * ]} />
 * ```
 */
export function TroubleshootList({ items }: { items: TroubleshootItem[] }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <div className="my-6 space-y-3">
            {items.map((item, i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-xl border p-4',
                        isDark ? 'border-white/5 bg-white/[0.02]' : 'border-black/5 bg-black/[0.02]',
                    )}
                >
                    <p className={cn('text-xs font-mono mb-1', isDark ? 'text-[#f38ba8]' : 'text-red-500')}>
                        {item.error}
                    </p>
                    <p className={cn('text-sm', isDark ? 'text-[#a6adc8]' : 'text-black/50')}>{item.fix}</p>
                </div>
            ))}
        </div>
    )
}
