'use client'

import { useBlogTheme } from '@/app/(site)/(blog)/layout'
import {
    CheckList as SharedCheckList,
    type CheckListItem,
} from '@/components/ui/check-list'

export type { CheckListItem }

export function CheckList({ items }: { items: CheckListItem[] }) {
    const { theme } = useBlogTheme()
    return <SharedCheckList items={items} variant={theme === 'dark' ? 'dark' : 'light'} className="my-6" />
}
