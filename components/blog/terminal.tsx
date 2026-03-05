'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Copy } from 'lucide-react'
import { useBlogTheme } from '@/app/(blog)/layout'

/* ── Catppuccin Palettes ── */

const catppuccin = {
  mocha: {
    base:     '#12121b',
    mantle:   '#181825',
    crust:    '#0a0a12',
    surface0: '#313244',
    surface1: '#45475a',
    surface2: '#585b70',
    overlay0: '#6c7086',
    overlay1: '#7f849c',
    text:     '#cdd6f4',
    subtext0: '#a6adc8',
    subtext1: '#bac2de',
    green:    '#a6e3a1',
    red:      '#f38ba8',
    yellow:   '#f9e2af',
    blue:     '#89b4fa',
    mauve:    '#cba6f7',
    // traffic lights
    closeBg:  '#f38ba8',
    minBg:    '#f9e2af',
    maxBg:    '#a6e3a1',
  },
  latte: {
    base:     '#eff1f5',
    mantle:   '#e6e9ef',
    crust:    '#dce0e8',
    surface0: '#ccd0da',
    surface1: '#bcc0cc',
    surface2: '#acb0be',
    overlay0: '#9ca0b0',
    overlay1: '#8c8fa1',
    text:     '#4c4f69',
    subtext0: '#6c6f85',
    subtext1: '#5c5f77',
    green:    '#40a02b',
    red:      '#d20f39',
    yellow:   '#df8e1d',
    blue:     '#1e66f5',
    mauve:    '#8839ef',
    closeBg:  '#d20f39',
    minBg:    '#df8e1d',
    maxBg:    '#40a02b',
  },
}

interface TerminalLine {
  type: 'command' | 'output' | 'comment' | 'empty'
  text: string
  delay?: number
}

interface TerminalProps {
  title?: string
  lines: TerminalLine[]
  className?: string
}

function AnimatedLine({ line, isVisible, palette }: { line: TerminalLine; isVisible: boolean; index: number; palette: typeof catppuccin.mocha }) {
  const [displayedChars, setDisplayedChars] = useState(0)
  const [showCursor, setShowCursor] = useState(false)
  const [typingDone, setTypingDone] = useState(false)

  useEffect(() => {
    if (!isVisible || line.type !== 'command') {
      if (isVisible) setTypingDone(true)
      return
    }

    setShowCursor(true)
    const text = line.text
    let charIndex = 0

    const interval = setInterval(() => {
      charIndex++
      setDisplayedChars(charIndex)
      if (charIndex >= text.length) {
        clearInterval(interval)
        setTimeout(() => {
          setShowCursor(false)
          setTypingDone(true)
        }, 200)
      }
    }, 25)

    return () => clearInterval(interval)
  }, [isVisible, line.type, line.text])

  if (!isVisible && line.type === 'command') return null
  if (!isVisible && line.type !== 'command' && !typingDone) return null

  if (line.type === 'empty') return <div className="h-4" />

  if (line.type === 'comment') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-sm leading-relaxed"
        style={{ color: palette.overlay0 }}
      >
        {line.text}
      </motion.div>
    )
  }

  if (line.type === 'command') {
    return (
      <div className="flex items-start gap-2 text-sm leading-relaxed">
        <span className="shrink-0 select-none" style={{ color: palette.green }}>$</span>
        <span style={{ color: palette.green }}>
          {line.text.slice(0, displayedChars)}
          {showCursor && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block w-[7px] h-[14px] ml-px translate-y-[2px]"
              style={{ backgroundColor: palette.green }}
            />
          )}
        </span>
      </div>
    )
  }

  // output
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="text-sm leading-relaxed whitespace-pre-wrap pl-5"
      style={{ color: palette.subtext0 }}
    >
      {line.text}
    </motion.div>
  )
}

export default function Terminal({ title = '~/terminal', lines, className = '' }: TerminalProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [visibleLines, setVisibleLines] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  const { theme } = useBlogTheme()
  const palette = theme === 'dark' ? catppuccin.mocha : catppuccin.latte

  const commandText = lines
    .filter(l => l.type === 'command')
    .map(l => l.text)
    .join('\n')

  useEffect(() => {
    if (!isInView) return

    let currentLine = 0
    const timers: NodeJS.Timeout[] = []

    function showNextLine() {
      if (currentLine >= lines.length) return

      const line = lines[currentLine]
      const lineIndex = currentLine

      setVisibleLines(lineIndex + 1)

      let delay = line.delay ?? 0
      if (line.type === 'command') {
        delay = Math.max(delay, line.text.length * 25 + 400)
      } else if (line.type === 'output') {
        delay = Math.max(delay, 200)
      } else {
        delay = Math.max(delay, 100)
      }

      currentLine++
      timers.push(setTimeout(showNextLine, delay))
    }

    showNextLine()

    return () => timers.forEach(clearTimeout)
  }, [isInView, lines])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(commandText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      ref={ref}
      className={`relative group rounded-xl border overflow-hidden ${className}`}
      style={{
        backgroundColor: palette.base,
        borderColor: palette.surface0,
      }}
    >
      {/* Title bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{
          borderColor: palette.surface0,
          backgroundColor: palette.mantle,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.closeBg }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.minBg }} />
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: palette.maxBg }} />
          </div>
          <span className="ml-3 text-xs font-mono" style={{ color: palette.overlay0 }}>{title}</span>
        </div>
        {commandText && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md"
            style={{ color: palette.overlay1 }}
            title="Copiar comandos"
          >
            {copied ? <Check className="w-3.5 h-3.5" style={{ color: palette.green }} /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Terminal body */}
      <div className="p-4 sm:p-5 font-mono space-y-1 min-h-[60px] overflow-x-auto">
        {lines.map((line, i) => (
          <AnimatedLine
            key={i}
            line={line}
            isVisible={i < visibleLines}
            index={i}
            palette={palette}
          />
        ))}
      </div>
    </div>
  )
}
