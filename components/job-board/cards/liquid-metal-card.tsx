"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, DollarSign, Clock } from "lucide-react";
import type { JobData } from "../job-data";

export function LiquidMetalCard({ job }: { job: JobData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.3 }}
      className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-zinc-900 via-zinc-800/90 to-zinc-900 p-6 shadow-xl"
      style={{
        backgroundImage: `radial-gradient(ellipse at 30% 20%, rgba(200,200,220,0.08) 0%, transparent 50%), 
                          radial-gradient(ellipse at 70% 80%, rgba(160,160,200,0.06) 0%, transparent 50%)`,
      }}
    >
      {/* Noise overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Header with logo + status */}
      <div className="relative mb-5 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Chrome ring avatar */}
          <div className="rounded-full bg-gradient-to-br from-zinc-400 via-zinc-300 to-zinc-500 p-[2px]">
            <Image
              src={job.companyLogo}
              alt={job.company}
              width={44}
              height={44}
              unoptimized
              className="h-11 w-11 rounded-full bg-zinc-800"
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-zinc-100">
              {job.company}
            </div>
            <div className="font-mono text-[10px] tracking-wider text-zinc-500">
              ID: {job.id}
            </div>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1">
          <motion.div
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
          />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            {job.status}
          </span>
        </div>
      </div>

      {/* Job title */}
      <h3 className="mb-4 text-xl font-bold tracking-tight text-white">
        {job.title}
      </h3>

      {/* Metadata */}
      <div className="mb-4 space-y-2 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
          <span>{job.location}</span>
          <span className="rounded-md bg-zinc-700/50 px-2 py-0.5 text-xs text-zinc-300">
            {job.locationType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-zinc-200">{job.salary}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-zinc-500" />
          <span>{job.postedAt}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-1 flex flex-wrap gap-2">
        {job.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-zinc-700/50 bg-zinc-800/60 px-2.5 py-1 text-xs text-zinc-300"
          >
            {tag}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
