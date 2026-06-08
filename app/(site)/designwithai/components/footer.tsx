import React from 'react';
import Link from 'next/link';
import { Linkedin } from 'lucide-react';

export default function FooterSection() {
  return (
    <div className="w-full h-[200px] bg-[#212121] flex flex-col items-center justify-center gap-4">
      <Link
        href="https://www.linkedin.com/company/aibuildersmexico"
        target="_blank"
        className="flex items-center justify-center size-10 rounded-full text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
        aria-label="LinkedIn"
      >
        <Linkedin className="size-5" />
      </Link>
      <div className="text-white/30 text-[10px] sm:text-xs font-mono tracking-widest uppercase text-center px-4">
        2026 – built in v0, hand crafted in cursor, made with ♥︎ by aibuilders.mx
      </div>
    </div>
  );
}
