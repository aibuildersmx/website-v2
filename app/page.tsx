"use client";

import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats";
import ContentSection from "@/components/content-3";
import EventsSection from "@/components/events-section";
import TeamSection from "@/components/team";
import CTASection from "@/components/cta-section";
import { useEffect, useRef } from "react";

export default function Home() {
  const heroWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroWrapperRef.current) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      // Responsive reveal height
      const revealHeight = window.innerWidth < 640 ? 120 : window.innerWidth < 768 ? 160 : 200;
      
      // Calculate distance from bottom
      const distanceToBottom = documentHeight - (scrollY + windowHeight);
      
      // If we are within the reveal zone (last 200px)
      if (distanceToBottom <= revealHeight) {
        // Calculate opacity: 1 when distance is 200, 0 when distance is 0
        const opacity = Math.max(0, distanceToBottom / revealHeight);
        heroWrapperRef.current.style.opacity = opacity.toString();
      } else {
        heroWrapperRef.current.style.opacity = '1';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      <div ref={heroWrapperRef} className="fixed inset-0 -z-10 transition-opacity duration-75 ease-linear will-change-opacity">
        <HeroSection />
      </div>
      
      <div className="relative z-10 bg-black mt-[100vh] mb-[120px] sm:mb-[160px] md:mb-[200px] shadow-[0_20px_50px_rgba(0,0,0,1)]">
        <StatsSection />
        <ContentSection />
        <EventsSection />
        <TeamSection />
        <CTASection />
      </div>
      
      {/* Footer Reveal Section */}
      <div className="fixed bottom-0 left-0 w-full h-[120px] sm:h-[160px] md:h-[200px] bg-[#212121] flex items-center justify-center -z-20">
        <div className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center px-4">
        2026 – built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
        </div>
      </div>
    </div>
  );
}
