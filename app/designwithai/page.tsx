import React from 'react';
import HeroSection from './components/hero-section';
import ToolsSlider from './components/tools-slider';
import ShowcaseSection from './components/showcase-section';
import ModulesSection from './components/modules-section';
import TestimonialsSection from './components/testimonials';
import CTASection from './components/cta-section';

export default function DesignWithAIPage() {
  return (
    <main>
      <HeroSection />
      <div className="relative z-10 bg-white">
        <ShowcaseSection />
        <ModulesSection />
        <ToolsSlider />
        <TestimonialsSection />
        <CTASection />
      </div>
    </main>
  );
}
