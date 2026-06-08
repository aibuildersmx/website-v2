'use client'

import type { ReactNode } from 'react'
import { Download } from 'lucide-react'
import { useBlogTheme } from '@/app/(site)/(blog)/layout'
import { cn } from '@/lib/utils'

/**
 * Centered download call-to-action. Outputs a single themed button centered
 * horizontally with a download icon to the left of the label.
 *
 * Example:
 * ```mdx
 * <DownloadButton href="/assets/starter.zip">Descarga la plantilla</DownloadButton>
 * ```
 */
export function DownloadButton({
    href,
    children,
}: {
    href: string
    children: ReactNode
}) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <div className="my-8 text-center">
            <a
                href={href}
                download
                className={cn(
                    'inline-flex items-center gap-3 px-8 py-4 text-base font-medium rounded-xl border transition-all duration-200 no-underline',
                    isDark
                        ? 'bg-white/[0.04] border-white/10 text-[#cdd6f4] hover:bg-white/[0.08] hover:border-white/20'
                        : 'bg-black/[0.03] border-black/10 text-black hover:bg-black/[0.06] hover:border-black/20',
                )}
            >
                <Download className="w-5 h-5" />
                {children}
            </a>
        </div>
    )
}
