import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default function ContentSection() {
    return (
        <section className="py-24 md:py-32 bg-white text-black" id="manifesto">
            <div className="mx-auto max-w-6xl space-y-12 px-6 md:space-y-16">
                <div className="relative overflow-hidden rounded-3xl border border-black/5 h-[500px]">
                    <img
                        className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                        src="/us.png"
                        alt="AI Builders Community"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                <div className="grid gap-8 md:grid-cols-2 md:gap-16 items-start">
                    <h2 className="text-4xl font-medium leading-tight font-instrument md:text-5xl">
                        Construyendo el futuro de la IA en México.
                    </h2>
                    <div className="space-y-8">
                        <p className="text-black/60 text-lg leading-relaxed">
                            AI Builders es más que una comunidad; es un ecosistema donde desarrolladores, diseñadores y emprendedores se reúnen para explorar nuevos tools, modelos y crear productos digitales.
                        </p>

                        
                    </div>
                </div>
            </div>
        </section>
    )
}
