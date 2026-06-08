'use client'

import { ExternalLink } from 'lucide-react'
import { useBlogTheme } from '@/app/(site)/(blog)/layout'
import { cn } from '@/lib/utils'

export type ResourceLink = {
    label: string
    url: string
    desc: string
}

/**
 * Vertical list of external-link cards. Typical use: the "Recursos" section
 * at the bottom of a post. Internal links (starting with `/`) are rendered
 * without `target="_blank"`.
 *
 * Example:
 * ```mdx
 * <ResourceLinks items={[
 *   { label: 'Docs', url: 'https://example.com/docs', desc: 'Official reference' },
 *   { label: 'Guía', url: '/blog/otra-guia', desc: 'Post relacionado' },
 * ]} />
 * ```
 */
export function ResourceLinks({ items }: { items: ResourceLink[] }) {
    const { theme } = useBlogTheme()
    const isDark = theme === 'dark'

    return (
        <div className="my-6 space-y-3">
            {items.map((link) => {
                const isExternal = !link.url.startsWith('/')
                return (
                    <a
                        key={link.url}
                        href={link.url}
                        target={isExternal ? '_blank' : undefined}
                        rel={isExternal ? 'noopener noreferrer' : undefined}
                        className={cn(
                            'no-underline flex items-center justify-between rounded-xl border p-4 transition-all group',
                            isDark
                                ? 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                                : 'border-black/10 bg-black/[0.02] hover:bg-black/[0.04] hover:border-black/20',
                        )}
                    >
                        <div>
                            <p className={cn('text-sm font-medium', isDark ? 'text-[#cdd6f4]' : 'text-black')}>
                                {link.label}
                            </p>
                            <p className={cn('text-xs mt-0.5', isDark ? 'text-[#6c7086]' : 'text-black/40')}>
                                {link.desc}
                            </p>
                        </div>
                        <ExternalLink className={cn('w-4 h-4 shrink-0', isDark ? 'text-[#6c7086]' : 'text-black/40')} />
                    </a>
                )
            })}
        </div>
    )
}
