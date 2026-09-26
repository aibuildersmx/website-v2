"use client";

import { useEffect, useId, useRef } from "react";

/**
 * The Grok Bot face: a lit sphere with two slanted pill eyes, as on the meetup's
 * Luma cover. Motion follows x.ai's own avatar (introducing-grok-bot): one rAF
 * loop, no CSS keyframes.
 *
 * - Idle: layered slow sines on turn / tilt / roll, plus a 0.7% "breath" scale.
 * - Blink: eyes drop to 5% at once, hold 70ms, pop to 108% by 150ms, settle by
 *   300ms. Every 6–14s, with a 14% chance of a double blink.
 * - Gaze: follows the pointer when `follow` is set (and a mouse exists);
 *   otherwise it drifts to a new spot every 2.5–5.5s.
 *
 * With reduced motion the face just holds still and looks at you.
 */
export function GrokOrb({
  className,
  ink = "#ffffff",
  follow = false,
  float = 0,
  seed = 0,
}: {
  className?: string;
  /** Head color. Eyes are always black. */
  ink?: string;
  /** Mouse tracking for the eyes. */
  follow?: boolean;
  /** Extra vertical drift in px, for small orbs floating in the background. */
  float?: number;
  /** Phase offset, so several orbs on one page don't move in lockstep. */
  seed?: number;
}) {
  const id = useId();
  const bodyRef = useRef<SVGSVGElement>(null);
  const gazeRef = useRef<SVGGElement>(null);
  const lidsRef = useRef<SVGGElement[]>([]);

  useEffect(() => {
    const body = bodyRef.current;
    const gazeEl = gazeRef.current;
    if (!body || !gazeEl || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const start = performance.now() - seed * 7919;
    let raf = 0;
    let nextBlink = performance.now() + rand(1200, 4000);
    let blinkAt = -Infinity;
    let double = false;
    let nextGaze = performance.now() + rand(2500, 5500);
    const gaze = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let pointer: { x: number; y: number } | null = null;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") pointer = { x: e.clientX, y: e.clientY };
    };
    if (follow) window.addEventListener("pointermove", onMove, { passive: true });

    // Eye openness `ms` into a blink.
    const openness = (ms: number) => {
      if (ms < 0 || ms >= 300) return 1;
      if (ms < 70) return 0.05;
      if (ms < 150) return 0.05 + (1.08 - 0.05) * ((ms - 70) / 80);
      return 1.08 - 0.08 * ((ms - 150) / 150);
    };

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      const turn = 1.5 * Math.sin(0.5 * t) + 0.6 * Math.sin(0.17 * t);
      const tilt = Math.sin(0.27 * t);
      const roll = 1.2 * Math.sin(0.85 * t);
      const scale = 1 + 0.007 * Math.sin(0.85 * t);
      const drift = float * Math.sin(0.4 * t);
      body.style.transform = `translateY(${drift}px) perspective(720px) rotateX(${tilt * 3}deg) rotateY(${turn * 3}deg) rotateZ(${roll}deg) scale(${scale})`;

      if (pointer) {
        const r = body.getBoundingClientRect();
        const dx = (pointer.x - (r.left + r.width / 2)) / window.innerWidth;
        const dy = (pointer.y - (r.top + r.height / 2)) / window.innerHeight;
        target.x = Math.max(-1, Math.min(1, dx * 2)) * 34;
        target.y = Math.max(-1, Math.min(1, dy * 2)) * 22;
      } else if (now >= nextGaze) {
        target.x = rand(-18, 18);
        target.y = rand(-10, 10);
        nextGaze = now + rand(2500, 5500);
      }
      gaze.x += (target.x - gaze.x) * 0.09;
      gaze.y += (target.y - gaze.y) * 0.09;
      gazeEl.setAttribute("transform", `translate(${gaze.x.toFixed(2)} ${gaze.y.toFixed(2)})`);

      if (now >= nextBlink) {
        blinkAt = now;
        double = Math.random() < 0.14;
        nextBlink = now + rand(6000, 14000);
      }
      const ms = now - blinkAt;
      const open = double && ms >= 370 ? openness(ms - 370) : openness(ms);
      for (const lid of lidsRef.current) lid.style.transform = `scaleY(${open})`;

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [follow, float, seed]);

  const lid = (i: number) => (el: SVGGElement | null) => {
    if (el) lidsRef.current[i] = el;
  };
  const lidStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;

  return (
    <svg ref={bodyRef} viewBox="0 0 600 600" className={className} aria-hidden="true" style={{ willChange: "transform" }}>
      <defs>
        {/* One shading layer over a flat ink, so any bot color gets the same lit-sphere look. */}
        <radialGradient id={`${id}-shade`} cx="0.42" cy="0.48" r="0.62">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.38" />
        </radialGradient>
      </defs>
      <circle cx="300" cy="300" r="300" fill={ink} />
      <circle cx="300" cy="300" r="300" fill={`url(#${id}-shade)`} />
      <g ref={gazeRef}>
        <g ref={lid(0)} style={lidStyle}>
          <rect x="175" y="245" width="92" height="200" rx="46" transform="rotate(-34 221 345)" fill="#000" />
        </g>
        <g ref={lid(1)} style={lidStyle}>
          <rect x="338" y="150" width="84" height="186" rx="42" transform="rotate(-34 380 243)" fill="#000" />
        </g>
      </g>
    </svg>
  );
}

/** The teal pointer from the cover: a cursor chasing the little bot next to it. */
export function GrokPointer({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 90" className={className} aria-hidden="true">
      <path d="M40 10 L52 66 L10 74 Z" fill="#0b8f7f" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
}
