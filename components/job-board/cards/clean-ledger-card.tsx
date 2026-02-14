"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  MapPin,
  DollarSign,
  ArrowRight,
  Pencil,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";
import type { JobData } from "../job-data";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function useTextScramble(text: string, isActive: boolean) {
  const [display, setDisplay] = useState(text);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    let iteration = 0;
    const upper = text.toUpperCase();

    intervalRef.current = setInterval(() => {
      setDisplay(
        upper
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            if (i < iteration) return upper[i];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration += 1.5;

      if (iteration > upper.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setDisplay(text.toUpperCase());
      }
    }, 30);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, text]);

  return isActive ? display : text;
}

export function CleanLedgerCard({
  job,
  onEdit,
  onDelete,
}: {
  job: JobData;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const isRecruiterView = !!(onEdit || onDelete);
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [editHovered, setEditHovered] = useState(false);
  const [deleteHovered, setDeleteHovered] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const scrambledApply = useTextScramble("Apply now", ctaHovered);
  const scrambledEdit = useTextScramble("Edit", editHovered);
  const scrambledDelete = useTextScramble("Delete", deleteHovered);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative w-full rounded-2xl bg-gray-200 p-px sm:max-w-[420px]"
    >
      {/* ---- Cursor-following border glow ---- */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(50, 50, 50, 0.7), transparent 40%)`,
        }}
      />

      {/* ---- Card content ---- */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow duration-300 group-hover:shadow-md">
        {/* ---- Top section (subtle bg) ---- */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-5 py-5 sm:px-8 sm:py-6">
          <div className="flex items-center gap-2.5">
            <img
              src={job.companyLogo}
              alt={job.company}
              className="h-10 w-10 rounded-xl"
            />
            <span className="text-sm text-gray-400">{job.company}</span>
          </div>

          <div className="flex items-center gap-2">
            {job.badge && (
              <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-indigo-600">
                {job.badge}
              </span>
            )}
            {/* Status pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  job.status === "Urgent"
                    ? "bg-blue-400"
                    : job.status === "Last Call"
                      ? "bg-orange-400"
                      : "bg-green-400"
                }`}
              />
              {job.status}
            </span>
          </div>
        </div>

        {/* Role name */}
        <div className="px-5 pt-6 pb-3 sm:px-8 sm:pt-8 sm:pb-4">
          <h3 className="font-serif text-2xl text-gray-700 sm:text-3xl">
            {job.title}
          </h3>
        </div>

        {/* Description */}
        <div className="px-5 pb-8 sm:px-8 sm:pb-10">
          <p className="text-sm leading-relaxed text-gray-500 sm:text-base">
            {job.description}
          </p>
        </div>

        <AnimatePresence initial={false}>
          {isDetailsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              {/* Details -- stacked rows */}
              <div className="flex flex-col gap-3 px-5 pb-5 sm:gap-4 sm:px-8 sm:pb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
                  <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.2em] text-gray-400">
                    <span>{job.location}</span>
                    <span className="text-gray-200">·</span>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] tracking-[0.15em] text-gray-500">
                      {job.locationType}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300">
                    T
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-gray-400">
                    {job.team}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-4 w-4 text-gray-300" strokeWidth={1.5} />
                  <span className="font-mono text-xs uppercase tracking-[0.2em] text-gray-400">
                    {job.salary}
                  </span>
                </div>
              </div>

              {/* Skills section */}
              <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-gray-200 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ---- Spacer pushes bottom group down ---- */}
        <div className="flex-1" />

        {/* ---- Bottom section (subtle bg) ---- */}
        <div className="border-t border-gray-200 bg-gray-50/80 px-5 py-6 sm:px-8 sm:py-8">
          {isRecruiterView ? (
            <div className="flex items-center gap-3">
              {onEdit && (
                <motion.button
                  type="button"
                  onClick={onEdit}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={() => setEditHovered(true)}
                  onMouseLeave={() => setEditHovered(false)}
                  className="group/cta inline-flex items-center overflow-hidden rounded-full bg-gray-900 py-4 pl-8 pr-8 font-mono text-xs font-medium uppercase tracking-[0.25em] text-white transition-all duration-300 ease-out hover:bg-gray-800 hover:pr-4"
                >
                  <Pencil className="mr-2.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  <span className="inline-block whitespace-nowrap">{scrambledEdit}</span>
                  <span className="ml-0 flex h-7 w-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 opacity-0 transition-all duration-300 ease-out group-hover/cta:ml-3 group-hover/cta:w-7 group-hover/cta:opacity-100">
                    <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  </span>
                </motion.button>
              )}
              {onDelete && (
                <motion.button
                  type="button"
                  onClick={onDelete}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={() => setDeleteHovered(true)}
                  onMouseLeave={() => setDeleteHovered(false)}
                  className="group/cta inline-flex items-center overflow-hidden rounded-full border border-red-200 bg-white py-4 pl-8 pr-8 font-mono text-xs font-medium uppercase tracking-[0.25em] text-red-500 transition-all duration-300 ease-out hover:border-red-300 hover:bg-red-50 hover:pr-4"
                >
                  <Trash2
                    className="mr-2.5 h-3.5 w-3.5 shrink-0 transition-opacity duration-200 group-hover/cta:opacity-0"
                    strokeWidth={1.5}
                  />
                  <span className="inline-block whitespace-nowrap">{scrambledDelete}</span>
                  <span className="ml-0 flex h-7 w-0 items-center justify-center overflow-hidden rounded-full border border-red-200 bg-red-50 opacity-0 transition-all duration-300 ease-out group-hover/cta:ml-3 group-hover/cta:w-7 group-hover/cta:opacity-100">
                    <Trash2 className="h-3.5 w-3.5 shrink-0 text-red-400" strokeWidth={2} />
                  </span>
                </motion.button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <motion.a
                href={job.applyUrl}
                whileTap={{ scale: 0.97 }}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                className="group/cta inline-flex items-center overflow-hidden rounded-full bg-gray-900 py-3 pl-8 pr-8 font-mono text-xs font-medium uppercase tracking-[0.25em] text-white transition-all duration-300 ease-out hover:bg-gray-800 hover:pr-5"
              >
                <span className="inline-block whitespace-nowrap">{scrambledApply}</span>
                <span className="ml-0 flex h-7 w-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10 opacity-0 transition-all duration-300 ease-out group-hover/cta:ml-4 group-hover/cta:w-7 group-hover/cta:opacity-100">
                  <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                </span>
              </motion.a>

              <button
                type="button"
                onClick={() => setIsDetailsOpen((prev) => !prev)}
                aria-label={isDetailsOpen ? "Hide details" : "Show details"}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
              >
                {isDetailsOpen ? (
                  <Minus className="h-4 w-4" strokeWidth={2} />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
