'use client'

import type { ReactNode } from 'react'
import { Shield } from 'lucide-react'
import { useBlogTheme } from '@/app/(site)/(blog)/layout'
import { cn } from '@/lib/utils'

export type SecurityListItem = {
    title: string
    description: ReactNode
}

/**
 * Red-tinted, shield-icon card stack for security/hardening checklists.
 *
 * Use for "rules of thumb" blocks where each rule gets a short headline
 * and a one-paragraph rationale. For a single-paragraph warning, prefer
 * <Callout type="security">.
 *
 * Example:
 * ```mdx
 * <SecurityList items={[
 *   { title: 'Nunca en tu laptop', description: 'Corre el agente en un VPS.' },
 *   { title: 'Cuenta dedicada', description: 'No uses tus credenciales personales.' },
 * ]} />
 * ```
 */
export function SecurityList({ items }: { items: SecurityListItem[] }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <div className="my-6 space-y-4">
            {items.map((item) => (
                <div
                    key={item.title}
                    className={cn(
                        'rounded-xl border p-4 sm:p-5',
                        isDark ? 'border-[#f38ba8]/20 bg-[#f38ba8]/5' : 'border-red-100 bg-red-50/50',
                    )}
                >
                    <div className="flex items-start gap-3">
                        <Shield className={cn('w-4 h-4 shrink-0 mt-0.5', isDark ? 'text-[#f38ba8]' : 'text-red-400')} />
                        <div className="flex-1 min-w-0">
                            <p className={cn('text-sm font-medium mb-1', isDark ? 'text-[#cdd6f4]' : 'text-black')}>
                                {item.title}
                            </p>
                            <p className={cn('text-sm', isDark ? 'text-[#a6adc8]' : 'text-black/50')}>
                                {item.description}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
