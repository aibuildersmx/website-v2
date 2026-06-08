'use client'

import type { ReactNode } from 'react'
import { useBlogTheme } from '@/app/(site)/(blog)/layout'
import { cn } from '@/lib/utils'

export type StepListVariant = 'default' | 'success'
export type StepListCounter = 'number' | 'check'
export type StepListItem = string | { label?: string; text: ReactNode }

/**
 * Numbered (or check-prefixed) step cards.
 *
 * Use for 3–7-item walk-throughs such as "how to install" or "how to set up".
 * Variants:
 *  - `default` — subtle border / neutral counter. The go-to.
 *  - `success` — green accents. Use for the "recommended" path in a "pick one"
 *    context (e.g. integracion-google "Cuenta dedicada" approach).
 *
 * Prefer plain markdown ordered lists (`1. …`) for simple sequences; reach
 * for this component when you want visually separated cards per step.
 *
 * Example:
 * ```mdx
 * <StepList steps={[
 *   'Open your browser.',
 *   'Navigate to example.com.',
 *   'Click sign in.',
 * ]} />
 * ```
 */
export function StepList({
    steps,
    variant = 'default',
    counter = 'number',
}: {
    steps: StepListItem[]
    variant?: StepListVariant
    counter?: StepListCounter
}) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    const cardClass =
        variant === 'success'
            ? isDark
                ? 'border-[#a6e3a1]/20 bg-[#a6e3a1]/5'
                : 'border-emerald-100 bg-emerald-50/50'
            : isDark
                ? 'border-white/5 bg-white/[0.02]'
                : 'border-black/5 bg-black/[0.02]'

    const counterClass =
        variant === 'success'
            ? isDark
                ? 'text-[#a6e3a1]'
                : 'text-emerald-500'
            : isDark
                ? 'text-[#6c7086]'
                : 'text-black/40'

    const textClass = isDark ? 'text-[#a6adc8]' : 'text-black/50'

    return (
        <div className="my-6 space-y-3">
            {steps.map((step, i) => {
                const text = typeof step === 'string' ? step : step.text
                const explicitLabel = typeof step !== 'string' ? step.label : undefined
                const defaultLabel = counter === 'check' ? '✓' : String(i + 1)
                const label = explicitLabel ?? defaultLabel
                return (
                    <div key={i} className={cn('flex items-start gap-3 rounded-xl border p-4', cardClass)}>
                        <span className={cn('font-mono text-xs shrink-0 mt-0.5', counterClass)}>{label}</span>
                        <div className={cn('text-sm flex-1 min-w-0', textClass)}>{text}</div>
                    </div>
                )
            })}
        </div>
    )
}
