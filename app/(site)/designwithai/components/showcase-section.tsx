'use client';

import React from 'react';
import Demo1 from './demos/demo1';
import Demo2 from './demos/demo2';
import Demo3 from './demos/demo3';
import Demo4 from './demos/demo4';

const demos = [
  { title: 'Visuales', Component: Demo1 },
  { title: 'UI Prototipo', Component: Demo2 },
  { title: 'Landing Build', Component: Demo3 },
  { title: 'Deploy Final', Component: Demo4 },
];

export default function ShowcaseSection() {
  return (
    <section className="relative z-20 bg-white py-16 sm:py-24 px-4 sm:px-6">
      <div className="w-full lg:w-[75vw] mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="font-instrument text-4xl sm:text-5xl md:text-6xl tracking-tight text-black">
            Lo que vas a poder crear
          </h2>
        </div>

        <div className="rounded-2xl sm:rounded-3xl border border-black/10 bg-black/[0.02] p-2 sm:p-3 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3">
            {demos.map(({ title, Component }) => (
              <article
                key={title}
                className="overflow-hidden rounded-xl sm:rounded-2xl border border-black/10 h-full"
              >
                <div className="h-full">
                  <Component active />
                </div>
              </article>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
