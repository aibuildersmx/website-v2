import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const members = [
    {
        name: 'Ben Kim',
        role: 'Co-Founder',
        avatar: 'https://unavatar.io/x/benkimbuilds',
        link: 'https://x.com/benkimbuilds',
    },
    {
        name: 'Javier Rivero',
        role: 'Co-Founder',
        avatar: '/javier.avif',
        link: 'https://javierrivero.com/',
    },
    {
        name: 'Ricardo Garcia',
        role: 'Partner',
        avatar: '/ricardo.avif',
        link: 'https://x.com/ricgarcas',
    },
]

export default function TeamSection() {
    return (
        <section className="py-24 md:py-32 bg-white text-black border-t border-black/5" id="team">
            <div className="mx-auto max-w-6xl px-6">
                <div className="grid gap-4 md:gap-8 md:grid-cols-3">
                    {members.map((member, index) => (
                        <Link
                            key={index}
                            href={member.link}
                            target="_blank"
                            className="group flex flex-row md:flex-col bg-white border border-black/10 rounded-2xl overflow-hidden hover:border-black/20 transition-all duration-500 hover:shadow-lg hover:shadow-black/5"
                        >
                            {/* Image Container: Square on mobile, 4/5 on desktop */}
                            <div className="w-32 h-32 md:w-full md:h-auto md:aspect-[4/5] overflow-hidden bg-black/[0.02] shrink-0">
                                <img
                                    className={`h-full w-full object-cover grayscale transition-all duration-700 ${member.name === 'Javier Rivero' || member.name === 'Ricardo Garcia' ? '' : 'group-hover:grayscale-0'} group-hover:scale-110`}
                                    src={member.avatar}
                                    alt={member.name}
                                />
                            </div>
                            
                            {/* Content Container */}
                            <div className="p-5 md:p-6 flex flex-col flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-2 md:mb-4">
                                    <h3 className="text-2xl md:text-2xl font-instrument font-medium leading-tight truncate">
                                        {member.name}
                                    </h3>
                                    <span className="hidden md:block text-[10px] font-mono text-black/20 font-bold uppercase tracking-widest">
                                        / 0{index + 1}
                                    </span>
                                </div>
                                
                                <div className="mt-auto flex items-center justify-between">
                                    <span className="text-[10px] md:text-xs font-mono text-black/40 uppercase tracking-widest font-medium">
                                        {member.role}
                                    </span>
                                    <div className="text-black/20 group-hover:text-black transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                        <ArrowUpRight className="size-4" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
