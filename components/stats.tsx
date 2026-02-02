import { Card, CardContent } from "@/components/ui/card"
import { Users, Calendar, UserCheck } from "lucide-react"

const stats = [
    {
        label: "Builders",
        value: "1500+",
        icon: Users,
    },
    {
        label: "Eventos IRL y Online",
        value: "15+",
        icon: Calendar,
    },
    {
        label: "Asistentes a eventos",
        value: "700+",
        icon: UserCheck,
    },
]

export default function StatsSection() {
    return (
        <section className="relative py-12 sm:py-16 md:py-32 bg-white text-black border-t border-black/5">
            <div className="mx-auto max-w-6xl space-y-8 sm:space-y-10 px-4 sm:px-6 md:space-y-20 relative z-10">
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <h2 className="text-2xl sm:text-3xl font-medium lg:text-5xl font-instrument leading-tight">Nos gusta construir en comunidad</h2>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="group overflow-hidden border-black/10 rounded-xl sm:rounded-2xl hover:border-black/20 transition-all duration-500 hover:shadow-lg hover:shadow-black/5">
                            <CardContent className="p-4 sm:p-6 flex items-center gap-3 sm:gap-4 md:flex-col md:items-center md:text-center md:gap-6 md:py-10">
                                <div className="flex items-center justify-center size-10 sm:size-12 rounded-lg sm:rounded-xl bg-black/[0.03] border border-black/5 shrink-0 group-hover:bg-black group-hover:text-white transition-colors duration-500">
                                    <stat.icon className="size-4 sm:size-5" />
                                </div>
                                
                                <div className="flex-1 min-w-0 md:space-y-2">
                                    <div className="text-2xl sm:text-3xl font-bold tracking-tighter md:text-5xl">
                                        {stat.value}
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-black/40 font-medium leading-tight">
                                        {stat.label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
            
            {/* Subtle background gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.01] to-transparent pointer-events-none" />
        </section>
    )
}
