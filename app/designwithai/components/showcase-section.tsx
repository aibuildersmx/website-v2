'use client';

import React, { useRef } from 'react';
import { useScroll, useTransform, motion } from 'motion/react';
import Demo1 from './demos/demo1';
import Demo2 from './demos/demo2';
import Demo3 from './demos/demo3';
import Demo4 from './demos/demo4';

const DEMOS = [Demo1, Demo2, Demo3, Demo4];

// Transitions happen in the first TRANSITION_END portion of the scroll range.
// Everything after that keeps the last demo visible — giving it a dwell step.
const TRANSITION_END = 0.78;

// Each demo is visible for its own slice of the transition range.
// A small overlap (0.08) on each side creates a smooth crossfade.
function DemoSlide({
  index,
  total,
  scrollYProgress,
  children,
}: {
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
  children: React.ReactNode;
}) {
  const sliceSize = TRANSITION_END / total;
  const center = index * sliceSize + sliceSize / 2;
  const fadeWidth = 0.06;

  // First demo: already visible at scroll=0, fades out normally.
  // Last demo: fades in normally, stays visible at scroll=1.
  const inputRange = [
    Math.max(0, center - sliceSize / 2 - fadeWidth),
    center - sliceSize / 2 + fadeWidth,
    center + sliceSize / 2 - fadeWidth,
    Math.min(1, center + sliceSize / 2 + fadeWidth),
  ];
  const outputRange = [
    index === 0 ? 1 : 0,
    1,
    1,
    index === total - 1 ? 1 : 0,
  ];

  const opacity = useTransform(scrollYProgress, inputRange, outputRange);

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      {children}
    </motion.div>
  );
}

// Small dot indicator showing which demo is active
function DemoIndicator({
  index,
  total,
  scrollYProgress,
}: {
  index: number;
  total: number;
  scrollYProgress: ReturnType<typeof useScroll>['scrollYProgress'];
}) {
  const sliceSize = TRANSITION_END / total;
  const center = index * sliceSize + sliceSize / 2;
  const fadeWidth = 0.06;

  const inputRange = [
    Math.max(0, center - sliceSize / 2 - fadeWidth),
    center - sliceSize / 2 + fadeWidth,
    center + sliceSize / 2 - fadeWidth,
    Math.min(1, center + sliceSize / 2 + fadeWidth),
  ];
  const outputRange = [
    index === 0 ? 1 : 0.25,
    1,
    1,
    index === total - 1 ? 1 : 0.25,
  ];

  const opacity = useTransform(scrollYProgress, inputRange, outputRange);

  return (
    <motion.div
      className="size-1.5 rounded-full bg-black transition-all duration-300"
      style={{ opacity }}
    />
  );
}

export default function ShowcaseSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  return (
    // Tall outer section — gives scroll room for each demo + dwell on the last one
    <section ref={sectionRef} className="relative z-20 h-[600vh] bg-white">

      {/* Sticky frame — stays at top while you scroll through the section */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 overflow-hidden">

        <div className="text-center mb-8 sm:mb-12 shrink-0">
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl tracking-tight text-black">
            Lo que vas a poder crear
          </h2>
        </div>

        {/* Browser mockup */}
        <div className="relative w-full lg:w-[65vw] max-w-6xl h-[48vh] sm:h-[56vh] lg:h-[62vh] border border-black/10 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden bg-white shrink-0"
        >
          {/* Browser chrome bar */}
          <div className="absolute top-0 left-0 right-0 h-9 bg-black/[0.04] border-b border-black/8 flex items-center px-4 z-50 gap-3">
            <div className="flex gap-1.5 flex-shrink-0">
              <div className="size-2.5 rounded-full bg-black/15" />
              <div className="size-2.5 rounded-full bg-black/15" />
              <div className="size-2.5 rounded-full bg-black/15" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-white/70 border border-black/8 rounded-full px-4 py-0.5 text-[9px] font-mono text-black/35 tracking-wider max-w-48 truncate text-center">
                aibuilders.mx
              </div>
            </div>
            {/* Demo label */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {DEMOS.map((_, i) => (
                <DemoIndicator
                  key={i}
                  index={i}
                  total={DEMOS.length}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>
          </div>

          {/* Demo stack — all stacked, opacity driven by scroll */}
          <div className="absolute inset-0 top-9 overflow-hidden">
            {DEMOS.map((DemoComponent, index) => (
              <DemoSlide
                key={index}
                index={index}
                total={DEMOS.length}
                scrollYProgress={scrollYProgress}
              >
                <div className="w-full h-full overflow-hidden">
                  <DemoComponent />
                </div>
              </DemoSlide>
            ))}
          </div>
        </div>

        {/* Scroll hint — fades out as user starts scrolling */}
        <motion.p
          className="mt-6 text-[10px] font-mono uppercase tracking-widest text-black/30 shrink-0"
          style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
        >
          ↓ Scrollea para continuar
        </motion.p>

      </div>
    </section>
  );
}
