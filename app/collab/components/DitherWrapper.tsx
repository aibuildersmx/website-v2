'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Dither from './Dither'

// ============================================
// INTERNAL TOGGLE: Force dither to specific mode
// Set to 'dark' | 'light' | 'auto'
// 'auto' = follows the page theme
// ============================================
const FORCE_DITHER_MODE: 'dark' | 'light' | 'auto' = 'dark'

export default function DitherWrapper() {
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    // Determine effective mode based on toggle
    const effectiveMode = FORCE_DITHER_MODE === 'auto' ? resolvedTheme : FORCE_DITHER_MODE
    const isDark = effectiveMode === 'dark'

    // Dark mode: black background with gray waves
    // Light mode: white background with darker gray waves for more contrast
    const waveColor: [number, number, number] = isDark 
        ? [0.31, 0.31, 0.31]  // Dark gray waves for dark mode
        : [0.45, 0.45, 0.45]  // Darker gray waves for light mode (more contrast)
    const backgroundColor: [number, number, number] = isDark
        ? [0, 0, 0]           // Black background for dark mode
        : [1, 1, 1]           // White background for light mode

    // Don't render until mounted to avoid hydration mismatch
    if (!mounted) {
        return null
    }

    return (
        <Dither
            waveColor={waveColor}
            backgroundColor={backgroundColor}
            disableAnimation={false}
            enableMouseInteraction
            mouseRadius={0.3}
            colorNum={4}
            pixelSize={2}
            waveAmplitude={0.3}
            waveFrequency={3}
            waveSpeed={0.05}
        />
    )
}
