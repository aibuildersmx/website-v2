import type { Metadata } from "next";
import { HeroHeader } from "@/components/header";
import TeamSection from "@/components/team";
import Footer from "@/components/footer";

export const metadata: Metadata = {
  title: "Equipo - AI Builders Mexico",
  description:
    "Conoce al equipo detrás de AI Builders Mexico.",
};

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-white text-black">
      <HeroHeader />
      <div className="pt-16 sm:pt-20">
        <TeamSection />
      </div>
      <Footer />
    </main>
  );
}
