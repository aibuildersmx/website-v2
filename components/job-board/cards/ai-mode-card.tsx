"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import type { JobData } from "../job-data";

export function AiModeCard({ job }: { job: JobData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    []
  );

  const statusColor =
    job.status === "Urgent"
      ? "text-blue-400"
      : job.status === "Closing Soon"
        ? "text-orange-400"
        : "text-green-400";

  const statusDot =
    job.status === "Urgent"
      ? "bg-blue-400"
      : job.status === "Closing Soon"
        ? "bg-orange-400"
        : "bg-green-400";

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full sm:max-w-[420px]"
    >
      {/* Subtle glow on hover */}
      <div
        className="pointer-events-none absolute -inset-px rounded-2xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(500px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.04), transparent 40%)`,
        }}
      />

      {/* Card body */}
      <div className="relative flex h-full min-h-[420px] flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] font-mono shadow-2xl shadow-black/40 transition-colors duration-300 group-hover:border-white/[0.1] sm:min-h-[480px]">
        {/* ---- Header: avatar + company ---- */}
        <div className="flex items-center gap-3 px-5 pt-6 pb-1 sm:px-7 sm:pt-7">
          <img
            src={job.companyLogo}
            alt={job.company}
            className="h-11 w-11 rounded-full ring-1 ring-white/10"
          />
          <span className="text-[15px] font-semibold tracking-tight text-white/90">
            {job.company}
          </span>
        </div>

        {/* ---- Title as quoted text ---- */}
        <div className="px-5 pt-5 pb-1 sm:px-7">
          <p className="text-[15px] leading-relaxed text-white/50">
            &ldquo;{job.title}&rdquo;
          </p>
        </div>

        {/* ---- Description ---- */}
        <div className="px-5 pt-3 pb-1 sm:px-7">
          <p className="text-[13px] leading-relaxed text-white/35">
            {job.description}
          </p>
        </div>

        {/* ---- Metadata fields ---- */}
        <div className="flex flex-col gap-2.5 px-5 pt-4 sm:px-7">
          {/* skills */}
          <p className="text-[13px] leading-relaxed">
            <span className="text-white/30">skills: </span>
            <span className="font-medium text-white/80">
              {job.tags.join(", ")}
            </span>
          </p>

          {/* location */}
          <p className="text-[13px] leading-relaxed">
            <span className="text-white/30">location: </span>
            <span className="font-medium text-white/80">
              {job.location}
            </span>
          </p>

          {/* type */}
          <p className="text-[13px] leading-relaxed">
            <span className="text-white/30">type: </span>
            <span className="font-medium text-white/80">
              {job.locationType}
            </span>
          </p>
        </div>

        {/* ---- Spacer ---- */}
        <div className="flex-1" />

        {/* ---- Dashed separator ---- */}
        <div className="px-5 sm:px-7">
          <div className="border-t border-dashed border-white/10" />
        </div>

        {/* ---- Bottom info ---- */}
        <div className="flex flex-col gap-2 px-5 pt-5 sm:px-7">
          <p className="text-[13px] leading-relaxed">
            <span className="text-white/30">salary: </span>
            <span className="font-medium text-white/80">{job.salary}</span>
          </p>
          <p className="text-[13px] leading-relaxed">
            <span className="text-white/30">experience: </span>
            <span className="font-medium text-white/80">
              {job.experience}
            </span>
          </p>
          <p className="flex items-center gap-1.5 text-[13px] leading-relaxed">
            <span className="text-white/30">status: </span>
            <span
              className={`inline-flex h-1.5 w-1.5 rounded-full ${statusDot}`}
            />
            <span className={`font-medium ${statusColor}`}>
              {job.status}
            </span>
          </p>
        </div>

        {/* ---- Solid separator ---- */}
        <div className="mt-5 px-5 sm:px-7">
          <div className="border-t border-white/[0.08]" />
        </div>

        {/* ---- Bottom actions ---- */}
        <div className="flex items-center justify-end px-5 pt-4 pb-5 sm:px-7 sm:pb-6">
          <a
            href={job.applyUrl}
            className="text-[13px] text-white/25 transition-colors duration-200 hover:text-white/60"
          >
            [apply]
          </a>
        </div>
      </div>
    </motion.div>
  );
}
