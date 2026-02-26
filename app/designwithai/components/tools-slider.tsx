'use client';

import React from 'react';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { AnthropicBlack } from '@/components/ui/svgs/anthropicBlack';
import { Gemini } from '@/components/ui/svgs/gemini';
import { CursorLight } from '@/components/ui/svgs/cursorLight';
import { Lovable } from '@/components/ui/svgs/lovable';
import { V0Light } from '@/components/ui/svgs/v0Light';
import { Midjourney } from '@lobehub/icons';

type Tool = {
  name: string;
  icon: React.ReactNode;
};

const tools: Tool[] = [
  {
    name: 'Anthropic',
    icon: <AnthropicBlack className="h-4 w-auto fill-black" />,
  },
  {
    name: 'Gemini',
    icon: <Gemini className="h-5 w-auto" />,
  },
  {
    name: 'Midjourney',
    icon: <Midjourney size={18} />,
  },
  {
    name: 'Nano Banana',
    icon: <span className="text-lg leading-none">🍌</span>,
  },
  {
    name: 'v0',
    icon: <V0Light className="h-4 w-auto" />,
  },
  {
    name: 'Cursor',
    icon: <CursorLight className="h-5 w-auto" />,
  },
  {
    name: 'Lovable',
    icon: <Lovable className="h-5 w-auto" />,
  },
];

// Pre-repeat once so first paint already fills wide desktop viewports.
const sliderTools = [...tools, ...tools];

function ToolItem({ name, icon }: Tool) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-black/10 bg-white shadow-sm hover:border-black/20 transition-colors cursor-default select-none">
      {icon}
      <span className="text-sm font-mono text-black/70 whitespace-nowrap">
        {name}
      </span>
    </div>
  );
}

export default function ToolsSlider() {
  return (
    <section className="py-10 sm:py-14 border-t border-black/5 overflow-visible">
      <div className="w-full lg:w-[75vw] mx-auto px-4 mb-6 sm:mb-8 text-center">
        <p className="text-xs font-mono uppercase tracking-widest text-black/40">
          Herramientas y modelos que dominarás
        </p>
      </div>

      <div className="w-full lg:w-[75vw] mx-auto px-4">
        <div className="relative overflow-x-hidden overflow-y-visible py-4 -my-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 sm:w-20">
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent backdrop-blur-[3px]" />
            <div className="absolute inset-y-0 right-0 w-px bg-black/10" />
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 sm:w-20">
            <div className="absolute inset-0 bg-gradient-to-l from-white via-white/95 to-transparent backdrop-blur-[3px]" />
            <div className="absolute inset-y-0 left-0 w-px bg-black/10" />
          </div>

          <InfiniteSlider
            speed={40}
            speedOnHover={15}
            gap={12}
            className="overflow-visible py-2"
          >
            {sliderTools.map((tool, index) => (
              <ToolItem key={`${tool.name}-${index}`} name={tool.name} icon={tool.icon} />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}
