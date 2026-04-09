import Link from 'next/link'

export function TopMarquee() {
    return (
        <div className="fixed top-0 inset-x-0 z-[110] border-b border-black/10 bg-red-500/88 text-white backdrop-blur-md">
            <div className="flex h-12 items-center justify-center px-4 text-center sm:h-10">
                <Link
                    href="/designwithai"
                    className="inline-flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.28em] text-white transition-opacity hover:opacity-70 sm:text-xs"
                >
                    VIBECODING BOOTCAMP - REGÍSTRATE AHORA
                </Link>
            </div>
        </div>
    )
}
