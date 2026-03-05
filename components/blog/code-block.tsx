'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useBlogTheme } from '@/app/(blog)/layout'

/* ── Catppuccin Palettes (same as terminal) ── */
const catppuccin = {
  mocha: {
    base:     '#12121b',
    mantle:   '#181825',
    surface0: '#313244',
    overlay0: '#6c7086',
    overlay1: '#7f849c',
    text:     '#cdd6f4',
    subtext0: '#a6adc8',
    green:    '#a6e3a1',
  },
  latte: {
    base:     '#eff1f5',
    mantle:   '#e6e9ef',
    surface0: '#ccd0da',
    overlay0: '#9ca0b0',
    overlay1: '#8c8fa1',
    text:     '#4c4f69',
    subtext0: '#6c6f85',
    green:    '#40a02b',
  },
}

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  className?: string
}

export default function CodeBlock({ code, title, className = '' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const { theme } = useBlogTheme()
  const palette = theme === 'dark' ? catppuccin.mocha : catppuccin.latte

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`relative group rounded-xl border overflow-hidden ${className}`}
      style={{
        backgroundColor: palette.base,
        borderColor: palette.surface0,
      }}
    >
      {title && (
        <div
          className="flex items-center justify-between px-4 py-2.5 border-b"
          style={{
            borderColor: palette.surface0,
            backgroundColor: palette.mantle,
          }}
        >
          <span className="text-xs font-mono" style={{ color: palette.overlay0 }}>{title}</span>
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md"
            style={{ color: palette.overlay1 }}
            title="Copiar código"
          >
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: palette.green }} /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
      {!title && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md z-10"
          style={{ color: palette.overlay1 }}
          title="Copiar código"
        >
          {copied ? <Check className="w-3.5 h-3.5" style={{ color: palette.green }} /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      )}
      <pre className="p-4 sm:p-5 overflow-x-auto">
        <code className="text-sm font-mono leading-relaxed whitespace-pre" style={{ color: palette.subtext0 }}>
          {code}
        </code>
      </pre>
    </div>
  )
}
