"use client";

import HeroSection from "@/components/hero-section";
import StatsSection from "@/components/stats";
import ContentSection from "@/components/content-3";
import EventsSection from "@/components/events-section";
import OfferingSection from "@/components/offering-section";
import TeamSection from "@/components/team";
import CTASection from "@/components/cta-section";
import { BootcampChatWidget } from "@/components/bootcamp-chat-widget";
import Footer from "@/components/footer";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const [footerRevealActive, setFooterRevealActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!heroWrapperRef.current) return;
      
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const revealHeight = window.innerWidth < 768 ? 340 : 320;
      
      // Calculate distance from bottom
      const distanceToBottom = documentHeight - (scrollY + windowHeight);
      setFooterRevealActive(distanceToBottom <= revealHeight);
      
      // If we are within the reveal zone (last 200px)
      if (distanceToBottom <= revealHeight) {
        // Calculate opacity: 1 when distance is 200, 0 when distance is 0
        const opacity = Math.max(0, distanceToBottom / revealHeight);
        heroWrapperRef.current.style.opacity = opacity.toString();
      } else {
        heroWrapperRef.current.style.opacity = '1';
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      <BootcampChatWidget />
      <div ref={heroWrapperRef} className="fixed inset-0 -z-10 transition-opacity duration-75 ease-linear will-change-opacity">
        <HeroSection />
      </div>
      
      <div className="relative z-10 bg-black mt-[100vh] sm:mb-[340px] md:mb-[320px] shadow-[0_20px_50px_rgba(0,0,0,1)]">
        <StatsSection />
        <ContentSection />
        <EventsSection />
        <OfferingSection />
        <TeamSection />
        <CTASection />
      </div>
      <div className="relative z-10 sm:hidden">
        <Footer />
      </div>
      
      {/* Footer Reveal Section */}
      <Footer reveal revealActive={footerRevealActive} />
    </div>
  );
}
