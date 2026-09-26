"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * The Grok Bot face from the meetup's Luma cover: a lit white sphere with two
 * slanted pill eyes. Drawn as SVG so it stays crisp at any size. It blinks now
 * and then; with reduced motion it just looks at you.
 */
export function GrokOrb({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const blink = reduce
    ? undefined
    : {
        animate: { scaleY: [1, 1, 0.08, 1] },
        transition: { duration: 0.42, times: [0, 0.4, 0.6, 1], repeat: Infinity, repeatDelay: 4.2 },
      };

  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="grok-orb-light" cx="0.42" cy="0.48" r="0.62">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#ececec" />
          <stop offset="1" stopColor="#9d9d9d" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="300" fill="url(#grok-orb-light)" />
      <motion.g style={{ transformOrigin: "300px 300px", transformBox: "view-box" }} {...blink}>
        <rect x="175" y="245" width="92" height="200" rx="46" transform="rotate(-34 221 345)" fill="#000" />
        <rect x="338" y="150" width="84" height="186" rx="42" transform="rotate(-34 380 243)" fill="#000" />
      </motion.g>
    </svg>
  );
}

/** The little teal pointer + chat bubble that float next to the orb on the cover. */
export function GrokCursor({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 100" className={className} aria-hidden="true">
      <path
        d="M52 18 L62 70 L12 78 Z"
        fill="#0b8f7f"
        stroke="#fff"
        strokeWidth="6"
        strokeLinejoin="round"
      />
      <circle cx="130" cy="36" r="34" fill="#00BCA6" />
      <path d="M112 46 l12 -6 M134 38 l2 -14" stroke="#000" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}
