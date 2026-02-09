import { sampleJob, sampleJobs } from "@/components/job-board/job-data";
import { TerminalCard } from "@/components/job-board/cards/terminal-card";
import { LiquidMetalCard } from "@/components/job-board/cards/liquid-metal-card";
import { HolographicCard } from "@/components/job-board/cards/holographic-card";
import { NeonGlowCard } from "@/components/job-board/cards/neon-glow-card";
import { CircuitBoardCard } from "@/components/job-board/cards/circuit-board-card";
import { MatrixCard } from "@/components/job-board/cards/matrix-card";
import { RetroCrtCard } from "@/components/job-board/cards/retro-crt-card";
import { MinimalDarkCard } from "@/components/job-board/cards/minimal-dark-card";
import { GlassmorphismCard } from "@/components/job-board/cards/glassmorphism-card";
import { BrutalistCard } from "@/components/job-board/cards/brutalist-card";
import { GradientMeshCard } from "@/components/job-board/cards/gradient-mesh-card";
import { PerspectiveCard } from "@/components/job-board/cards/perspective-card";
import { EventStyleCard } from "@/components/job-board/cards/event-style-card";
import { CleanLedgerCard } from "@/components/job-board/cards/clean-ledger-card";

const darkCards = [
  { name: "Terminal", Component: TerminalCard },
  { name: "Liquid Metal", Component: LiquidMetalCard },
  { name: "Holographic", Component: HolographicCard },
  { name: "Neon Glow", Component: NeonGlowCard },
  { name: "Circuit Board", Component: CircuitBoardCard },
  { name: "Matrix", Component: MatrixCard },
  { name: "Retro CRT", Component: RetroCrtCard },
  { name: "Minimal Dark", Component: MinimalDarkCard },
];

const lightCards = [
  { name: "Glassmorphism", Component: GlassmorphismCard },
  { name: "Brutalist", Component: BrutalistCard },
  { name: "Gradient Mesh", Component: GradientMeshCard },
  { name: "3D Perspective", Component: PerspectiveCard },
  { name: "Event Style", Component: EventStyleCard },
  { name: "Clean Ledger", Component: CleanLedgerCard },
];

export default function Home() {
  // Rotate through the sample jobs so cards show variety
  const getJob = (index: number) => sampleJobs[index % sampleJobs.length];

  return (
    <div className="min-h-screen">
      {/* Page header */}
      <header className="border-b border-white/[0.06] bg-neutral-950 px-6 py-16 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl">
          Job Card Prototypes
        </h1>
        <p className="mx-auto max-w-lg text-base text-white/40">
          14 distinct futuristic card designs for job listings — dark and light
          themes with hover animations and unique visual treatments.
        </p>
      </header>

      {/* Dark Section */}
      <section className="bg-neutral-950 px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-white/[0.06]" />
            <h2 className="whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-white/30">
              Dark Theme
            </h2>
            <div className="h-px flex-1 bg-white/[0.06]" />
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-8 md:grid-cols-2 xl:grid-cols-3">
            {darkCards.map(({ name, Component }, i) => (
              <div key={name} className="flex flex-col items-center gap-3">
                <Component job={getJob(i)} />
                <span className="text-xs font-medium tracking-wider text-white/20 uppercase">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Light Section */}
      <section
        className="px-6 py-16"
        style={{
          background: `
            radial-gradient(at 0% 0%, rgba(251,113,133,0.12) 0%, transparent 50%),
            radial-gradient(at 100% 0%, rgba(96,165,250,0.12) 0%, transparent 50%),
            radial-gradient(at 50% 100%, rgba(167,139,250,0.1) 0%, transparent 50%),
            #fafafa
          `,
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-200" />
            <h2 className="whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-gray-400">
              Light Theme
            </h2>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 justify-items-center gap-10 md:grid-cols-2 xl:grid-cols-3">
            {lightCards.map(({ name, Component }, i) => (
              <div key={name} className="flex flex-col items-center gap-3">
                <Component job={getJob(i)} />
                <span className="text-xs font-medium tracking-wider text-gray-400 uppercase">
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-neutral-950 px-6 py-8 text-center">
        <p className="text-xs text-white/20">
          Built with Next.js, Tailwind CSS, and Framer Motion — AIBM Job Board
          Prototypes
        </p>
      </footer>
    </div>
  );
}
