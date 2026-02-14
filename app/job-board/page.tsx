"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { CleanLedgerCard } from "@/components/job-board/cards/clean-ledger-card";
import { AiModeCard } from "@/components/job-board/cards/ai-mode-card";
import { AiModeToggle } from "@/components/job-board/ai-mode-toggle";
import type { JobData } from "@/components/job-board/job-data";
import { TEAM_OPTIONS } from "@/components/job-board/team-options";
import { AnimatePresence, motion } from "framer-motion";
import { X, MessageCircle, SlidersHorizontal, ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LocationType = "Remote" | "Hybrid" | "On-site";
type StatusType = "New" | "Urgent" | "Last Call";
type FilterKey = "location" | "team" | "status";

function getCompanyInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "C";
  if (words.length === 1) return words[0][0]?.toUpperCase() ?? "C";

  return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase() || "CO";
}

/* ------------------------------------------------------------------ */
/*  Helper: Convert DB row to JobData                                   */
/* ------------------------------------------------------------------ */
function dbToJobData(row: {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  location_type: string | null;
  salary: string | null;
  experience: string | null;
  team: string | null;
  tags: string[] | null;
  status: string;
  apply_url: string | null;
  created_at: string;
  company: {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
  };
}): JobData {
  const createdAt = new Date(row.created_at);
  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let postedAt = "Just now";
  if (diffDays > 0) {
    postedAt = diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    postedAt = diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  }

  return {
    id: row.id,
    title: row.title,
    company: row.company.name,
    companyLogo:
      row.company.logo_url ||
      `https://api.dicebear.com/9.x/initials/svg?seed=${getCompanyInitials(row.company.name)}&backgroundColor=6366f1`,
    team: row.team || "Software Engineering",
    location: row.location || "Remote",
    locationType: (row.location_type as LocationType) || "Remote",
    salary: row.salary || "Competitive",
    experience: row.experience || "Not specified",
    description: row.description || "",
    applyUrl: row.apply_url || "#",
    tags: row.tags || [],
    badge: row.tags?.includes("DEMO") ? "DEMO" : undefined,
    status: row.status === "Closing Soon" ? "Last Call" : (row.status as StatusType),
    postedAt,
  };
}

// Fallback data in case DB is empty
const fallbackJobs: JobData[] = [
  {
    id: "JB-2026-DEMO",
    title: "Senior AI Product Engineer",
    company: "AI Builders Mexico",
    companyLogo: "/favicon.svg",
    badge: "DEMO",
    team: "Software Engineering",
    location: "Ciudad de México, MX",
    locationType: "Hybrid",
    salary: "$80,000 - $110,000 USD",
    experience: "5+ years",
    description:
      "Lead end-to-end delivery of AI-native product features, from prototype to production. You will build with Next.js and Python services, orchestrate LLM workflows, and partner closely with design and growth to ship high-impact user experiences.",
    applyUrl:
      "mailto:talent@aibuilders.mx?subject=Application%20-%20Senior%20AI%20Product%20Engineer",
    tags: ["DEMO", "Next.js", "TypeScript", "Python", "LLMs", "Product"],
    status: "New",
    postedAt: "2 days ago",
  },
];

const locationTypes = ["All", "Remote", "Hybrid", "On-site"] as const;
const statusTypes = ["All", "Urgent", "New", "Last Call"] as const;

/* ------------------------------------------------------------------ */
/*  Filter pill component                                              */
/* ------------------------------------------------------------------ */
function FilterPill({
  label,
  active,
  onClick,
  aiMode,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  aiMode: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] transition-all duration-300 sm:px-4 sm:py-1.5"
      style={{
        borderColor: active
          ? aiMode
            ? "rgba(255,255,255,0.35)"
            : "rgba(0,0,0,0.6)"
          : aiMode
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.1)",
        backgroundColor: active
          ? aiMode
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.04)"
          : "transparent",
        color: active
          ? aiMode
            ? "rgba(255,255,255,0.85)"
            : "rgb(55,65,81)"
          : aiMode
            ? "rgba(255,255,255,0.3)"
            : "rgba(0,0,0,0.4)",
      }}
    >
      {label}
    </button>
  );
}

export default function JobBoardPage() {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState(false);
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [teamFilter, setTeamFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const teamTypes = useMemo(() => ["All", ...TEAM_OPTIONS], []);

  // Fetch jobs from Supabase
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          company:companies(*)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load jobs:", error);
        setJobs(fallbackJobs);
      } else if (data && data.length > 0) {
        setJobs(data.map((job) => dbToJobData(job as never)));
      } else {
        setJobs(fallbackJobs);
      }
      setLoading(false);
    }

    loadJobs();
  }, [supabase]);

  // Close chat bubble when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setChatOpen(false);
      }
    }
    if (chatOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [chatOpen]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      /* Location type */
      if (locationFilter !== "All" && job.locationType !== locationFilter)
        return false;
      /* Team / Area */
      if (teamFilter !== "All" && job.team !== teamFilter) return false;
      /* Status */
      if (statusFilter !== "All" && job.status !== statusFilter) return false;

      return true;
    });
  }, [jobs, locationFilter, teamFilter, statusFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const activeFilterCount =
    (locationFilter !== "All" ? 1 : 0) +
    (teamFilter !== "All" ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0;
  const activeFilterLabel =
    openFilter === "location"
      ? "Location"
      : openFilter === "team"
        ? "Team"
        : "Status";
  const activeFilterOptions =
    openFilter === "location"
      ? locationTypes
      : openFilter === "team"
        ? teamTypes
        : statusTypes;

  const clearAllFilters = () => {
    setLocationFilter("All");
    setTeamFilter("All");
    setStatusFilter("All");
  };

  return (
    <motion.div
      className="min-h-screen transition-colors duration-700 ease-out"
      animate={{
        backgroundColor: aiMode ? "#0a0a0a" : "#f5f5f4",
      }}
    >
      {/* Header – left-aligned */}
      <motion.header
        className="sticky top-0 border-b px-4 py-7 transition-colors duration-700 sm:px-6 sm:py-14 md:px-12 lg:px-16"
        animate={{
          backgroundColor: aiMode ? "#0f0f0f" : "#ffffff",
          borderColor: aiMode
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.08)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
          <div>
          <motion.p
            className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em]"
            animate={{
              color: aiMode ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.35)",
            }}
          >
            AIBM Job Board
          </motion.p>

          <AnimatePresence mode="wait">
            {aiMode ? (
              <motion.h1
                key="ai-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-3 font-mono text-[1.75rem] font-medium leading-[1.15] tracking-tight text-white/90 sm:text-4xl md:text-5xl"
              >
                &gt; open_positions
              </motion.h1>
            ) : (
              <motion.h1
                key="default-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="mb-3 font-serif text-[2.25rem] leading-[1.1] text-gray-800 sm:text-5xl md:text-6xl"
              >
                Encuentra tu siguiente rol.
              </motion.h1>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {aiMode ? (
              <motion.p
                key="ai-desc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="max-w-lg font-mono text-[13px] leading-relaxed text-white/30"
              >
                encuentra tu siguiente rol
              </motion.p>
            ) : (
              <motion.p
                key="default-desc"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="max-w-lg text-base leading-relaxed text-gray-400"
              >
                Buscamos personas talentosas para unirse a equipos de clase mundial que están construyendo el futuro de la tecnología.
              </motion.p>
            )}
          </AnimatePresence>
          </div>

          <a href="https://aibuilders.mx" target="_blank" rel="noopener noreferrer" className="hidden shrink-0 sm:block">
            <motion.img
              src="/aibm-logo.svg"
              alt="AIBM"
              className="h-5 w-auto sm:h-6"
              animate={{
                filter: aiMode ? "brightness(1)" : "brightness(0)",
              }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </a>
        </div>
      </motion.header>

      {/* Job Cards Grid */}
      <motion.main
        className="relative z-10 rounded-t-2xl px-4 py-6 sm:rounded-t-3xl sm:px-6 sm:py-10 md:px-12 lg:px-16"
        animate={{
          backgroundColor: aiMode ? "#0a0a0a" : "#f5f5f4",
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="mx-auto max-w-7xl">
        {/* ── Sticky filter bar ── */}
        <motion.div
          className="sticky top-0 z-20 -mx-4 px-4 pb-1 pt-4 sm:-mx-6 sm:px-6 sm:pt-6 md:-mx-12 md:px-12 lg:-mx-16 lg:px-16"
          animate={{
            backgroundColor: aiMode ? "#0a0a0a" : "#f5f5f4",
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >

        {/* ── Mobile toolbar: compact collapsible filters ── */}
        <div className="mb-6 sm:hidden">
          {/* Trigger row: Filters button + Toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border px-3.5 py-2 transition-colors duration-300"
              style={{
                borderColor: aiMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.1)",
                backgroundColor: aiMode
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.02)",
              }}
            >
              <SlidersHorizontal
                className="h-3.5 w-3.5 transition-colors duration-300"
                style={{
                  color: aiMode
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(0,0,0,0.45)",
                }}
                strokeWidth={1.5}
              />
              <span
                className="font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-300"
                style={{
                  color: aiMode
                    ? "rgba(255,255,255,0.5)"
                    : "rgba(0,0,0,0.45)",
                }}
              >
                Filters
              </span>
              {hasActiveFilters && (
                <span
                  className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[10px] font-semibold leading-none"
                  style={{
                    backgroundColor: aiMode
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.08)",
                    color: aiMode
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(0,0,0,0.6)",
                  }}
                >
                  {activeFilterCount}
                </span>
              )}
              <motion.div
                animate={{ rotate: filtersOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown
                  className="h-3 w-3 transition-colors duration-300"
                  style={{
                    color: aiMode
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0,0,0,0.3)",
                  }}
                  strokeWidth={1.5}
                />
              </motion.div>
            </button>

            <AiModeToggle
              enabled={aiMode}
              onToggle={() => setAiMode((prev) => !prev)}
            />
          </div>

          {/* Collapsible filter panel */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-4">
                  {/* Location trigger */}
                  <div className="flex items-center justify-between gap-3">
                    <motion.span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]"
                      animate={{
                        color: aiMode
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.35)",
                      }}
                    >
                      Location
                    </motion.span>
                    <FilterPill
                      label={locationFilter}
                      active={locationFilter !== "All" || openFilter === "location"}
                      onClick={() =>
                        setOpenFilter((prev) =>
                          prev === "location" ? null : "location"
                        )
                      }
                      aiMode={aiMode}
                    />
                  </div>

                  {/* Team trigger */}
                  <div className="flex items-center justify-between gap-3">
                    <motion.span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]"
                      animate={{
                        color: aiMode
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.35)",
                      }}
                    >
                      Team
                    </motion.span>
                    <FilterPill
                      label={teamFilter}
                      active={teamFilter !== "All" || openFilter === "team"}
                      onClick={() =>
                        setOpenFilter((prev) => (prev === "team" ? null : "team"))
                      }
                      aiMode={aiMode}
                    />
                  </div>

                  {/* Status trigger */}
                  <div className="flex items-center justify-between gap-3">
                    <motion.span
                      className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]"
                      animate={{
                        color: aiMode
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(0,0,0,0.35)",
                      }}
                    >
                      Status
                    </motion.span>
                    <FilterPill
                      label={statusFilter}
                      active={statusFilter !== "All" || openFilter === "status"}
                      onClick={() =>
                        setOpenFilter((prev) => (prev === "status" ? null : "status"))
                      }
                      aiMode={aiMode}
                    />
                  </div>

                  {/* Clear */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-300"
                      style={{
                        color: aiMode
                          ? "rgba(255,255,255,0.4)"
                          : "rgba(0,0,0,0.45)",
                      }}
                    >
                      <X className="h-3 w-3" strokeWidth={1.5} />
                      Clear
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Desktop toolbar: inline filters + toggle ── */}
        <div className="mb-10 hidden sm:flex sm:items-center sm:justify-between sm:gap-5">
          {/* Filter row */}
          <div className="flex items-center gap-6 overflow-x-auto pb-1 scrollbar-none">
            {/* Location trigger */}
            <div className="flex items-center gap-2">
              <motion.span
                className="mr-1 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]"
                animate={{
                  color: aiMode
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.35)",
                }}
              >
                Location
              </motion.span>
              <FilterPill
                label={locationFilter}
                active={locationFilter !== "All" || openFilter === "location"}
                onClick={() =>
                  setOpenFilter((prev) => (prev === "location" ? null : "location"))
                }
                aiMode={aiMode}
              />
            </div>

            {/* Divider */}
            <motion.div
              className="h-6 w-px"
              animate={{
                backgroundColor: aiMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.1)",
              }}
            />

            {/* Team trigger */}
            <div className="flex items-center gap-2">
              <motion.span
                className="mr-1 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]"
                animate={{
                  color: aiMode
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.35)",
                }}
              >
                Team
              </motion.span>
              <FilterPill
                label={teamFilter}
                active={teamFilter !== "All" || openFilter === "team"}
                onClick={() =>
                  setOpenFilter((prev) => (prev === "team" ? null : "team"))
                }
                aiMode={aiMode}
              />
            </div>

            {/* Divider */}
            <motion.div
              className="h-6 w-px"
              animate={{
                backgroundColor: aiMode
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(0,0,0,0.1)",
              }}
            />

            {/* Status trigger */}
            <div className="flex items-center gap-2">
              <motion.span
                className="mr-1 shrink-0 font-mono text-[10px] uppercase tracking-[0.2em]"
                animate={{
                  color: aiMode
                    ? "rgba(255,255,255,0.2)"
                    : "rgba(0,0,0,0.35)",
                }}
              >
                Status
              </motion.span>
              <FilterPill
                label={statusFilter}
                active={statusFilter !== "All" || openFilter === "status"}
                onClick={() =>
                  setOpenFilter((prev) => (prev === "status" ? null : "status"))
                }
                aiMode={aiMode}
              />
            </div>

            {/* Clear filters */}
            <AnimatePresence>
              {hasActiveFilters && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  type="button"
                  onClick={clearAllFilters}
                  className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.15em] transition-colors duration-300"
                  style={{
                    color: aiMode
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(0,0,0,0.45)",
                  }}
                >
                  <X className="h-3 w-3" strokeWidth={1.5} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle */}
          <div className="shrink-0">
            <AiModeToggle
              enabled={aiMode}
              onToggle={() => setAiMode((prev) => !prev)}
            />
          </div>
        </div>

        {/* Filter option panel */}
        <AnimatePresence>
          {openFilter && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="mb-6 rounded-2xl border p-4 sm:p-5"
              style={{
                borderColor: aiMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.1)",
                backgroundColor: aiMode
                  ? "rgba(255,255,255,0.02)"
                  : "rgba(255,255,255,0.5)",
              }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <motion.p
                  className="font-mono text-[11px] uppercase tracking-[0.2em]"
                  animate={{
                    color: aiMode
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(0,0,0,0.45)",
                  }}
                >
                  Select {activeFilterLabel}
                </motion.p>
                <button
                  type="button"
                  onClick={() => setOpenFilter(null)}
                  className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.15em]"
                  style={{
                    color: aiMode
                      ? "rgba(255,255,255,0.35)"
                      : "rgba(0,0,0,0.45)",
                  }}
                >
                  <X className="h-3 w-3" strokeWidth={1.5} />
                  Close
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeFilterOptions.map((option) => {
                  const isActive =
                    openFilter === "location"
                      ? locationFilter === option
                      : openFilter === "team"
                        ? teamFilter === option
                        : statusFilter === option;

                  return (
                    <FilterPill
                      key={`${openFilter}-${option}`}
                      label={option}
                      active={isActive}
                      onClick={() => {
                        if (openFilter === "location") setLocationFilter(option);
                        if (openFilter === "team") setTeamFilter(option);
                        if (openFilter === "status") setStatusFilter(option);
                        setOpenFilter(null);
                      }}
                      aiMode={aiMode}
                    />
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        </motion.div>

        {/* Results count */}
        <div className="mb-5 flex items-center gap-4 sm:mb-8">
          <motion.div
            className="h-px flex-1"
            animate={{
              backgroundColor: aiMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.12)",
            }}
          />
          <motion.span
            className="font-mono text-[10px] uppercase tracking-[0.3em]"
            animate={{
              color: aiMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.35)",
            }}
          >
            {aiMode
              ? `${filteredJobs.length}_results`
              : `${filteredJobs.length} ${filteredJobs.length === 1 ? "Result" : "Results"}`}
          </motion.span>
          <motion.div
            className="h-px flex-1"
            animate={{
              backgroundColor: aiMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.12)",
            }}
          />
        </div>

        {/* Empty state */}
        <AnimatePresence>
          {filteredJobs.length === 0 && (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="py-24 text-center"
            >
              <motion.p
                className="font-mono text-sm"
                animate={{
                  color: aiMode
                    ? "rgba(255,255,255,0.25)"
                    : "rgba(0,0,0,0.35)",
                }}
              >
                {aiMode
                  ? "> no matching roles found."
                  : "No roles match your filters."}
              </motion.p>
              <motion.button
                type="button"
                onClick={() => {
                  clearAllFilters();
                  setOpenFilter(null);
                }}
                className="mt-4 font-mono text-xs uppercase tracking-[0.15em] underline decoration-dotted underline-offset-4 transition-colors duration-300"
                animate={{
                  color: aiMode
                    ? "rgba(255,255,255,0.4)"
                    : "rgba(0,0,0,0.45)",
                }}
              >
                {aiMode ? "clear_filters" : "Clear all filters"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card grid – per-card AnimatePresence for proper filter transitions */}
        <div
          className={`grid grid-cols-1 sm:justify-items-center md:grid-cols-2 xl:grid-cols-3 ${
            aiMode ? "gap-6 sm:gap-8" : "gap-7 sm:gap-10"
          }`}
        >
          <AnimatePresence>
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {aiMode ? (
                  <AiModeCard job={job} />
                ) : (
                  <CleanLedgerCard job={job} />
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        </div>
      </motion.main>

      {/* Footer */}
      <motion.footer
        className="relative z-10 border-t px-5 py-8 text-center transition-colors duration-700 sm:px-6 sm:py-10"
        animate={{
          backgroundColor: aiMode ? "#0f0f0f" : "#ffffff",
          borderColor: aiMode
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.08)",
        }}
      >
        <motion.p
          className="font-mono text-[11px] uppercase tracking-[0.2em]"
          animate={{
            color: aiMode ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.2)",
          }}
        >
          Built with Next.js, Tailwind CSS &amp; Framer Motion — AIBM 2026
        </motion.p>
      </motion.footer>

      {/* Floating chat agent widget */}
      <div ref={chatRef} className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
        {/* Chat bubble */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="mb-1 w-64 rounded-2xl border p-4 shadow-xl backdrop-blur-sm sm:w-72 sm:p-5"
              style={{
                backgroundColor: aiMode
                  ? "rgba(15, 15, 15, 0.95)"
                  : "rgba(255, 255, 255, 0.97)",
                borderColor: aiMode
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.08)",
              }}
            >
              <motion.p
                className="text-sm leading-relaxed"
                animate={{
                  color: aiMode ? "rgba(255,255,255,0.7)" : "rgb(55,65,81)",
                }}
              >
                {aiMode ? (
                  <>
                    <span className="font-mono text-xs text-white/30">&gt; </span>
                    Just kidding — you already talk to agents all day. But you
                    can join our{" "}
                    <a
                      href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-dotted underline-offset-2 transition-colors hover:text-white/90"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      WhatsApp Community
                    </a>{" "}
                    if you <em className="text-white/50">really</em> need to
                    talk to someone.{" "}
                    <span className="font-mono text-xs text-white/20">_</span>
                  </>
                ) : (
                  <>
                    Just kidding — you already talk to agents all day. But you
                    can join our{" "}
                    <a
                      href="https://chat.whatsapp.com/E7oCGyITLkX1aqFexJbbHm"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium underline decoration-dotted underline-offset-2 transition-colors hover:text-gray-900"
                      style={{ color: "rgb(99,102,241)" }}
                    >
                      WhatsApp chat
                    </a>{" "}
                    if you <em>really</em> need to talk to someone.{" "}
                  </>
                )}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat icon button */}
        <motion.button
          type="button"
          onClick={() => setChatOpen((prev) => !prev)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-shadow duration-300 hover:shadow-xl"
          style={{
            backgroundColor: aiMode ? "#1a1a1a" : "#ffffff",
            border: `1px solid ${aiMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle
            className="h-6 w-6 transition-colors duration-300"
            style={{
              color: aiMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
            }}
            strokeWidth={1.5}
          />

          {/* Hover tooltip */}
          <span
            className="pointer-events-none absolute bottom-full right-0 mb-2 whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-[11px] opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100"
            style={{
              backgroundColor: aiMode ? "#1a1a1a" : "#ffffff",
              color: aiMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)",
              border: `1px solid ${aiMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
            }}
          >
            Talk to an agent
          </span>
        </motion.button>
      </div>
    </motion.div>
  );
}
