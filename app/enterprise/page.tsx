import { EnterpriseHero } from './components/enterprise-hero'
import { WorkshopsSection } from './components/workshops-section'
import { ConsultingSection } from './components/consulting-section'
import { RecruitingSection } from './components/recruiting-section'
import { TalksSection } from './components/talks-section'
import { EnterpriseCTA } from './components/enterprise-cta'

export default function EnterprisePage() {
    return (
        <div className="relative min-h-screen bg-white">
            <EnterpriseHero />
            <WorkshopsSection />
            <ConsultingSection />
            <RecruitingSection />
            <TalksSection />
            <EnterpriseCTA />
            <footer className="bg-[#212121] py-12 sm:py-16">
                <p className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center px-4">
                    2026 — built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
                </p>
            </footer>
        </div>
    )
}
