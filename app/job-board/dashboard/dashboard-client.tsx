"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { CleanLedgerCard } from "@/components/job-board/cards/clean-ledger-card";
import type { JobData } from "@/components/job-board/job-data";
import { TEAM_OPTIONS, type TeamOption } from "@/components/job-board/team-options";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  X,
  Briefcase,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/lib/auth";
import { createJob, deleteJob, getOrCreateCompany, updateJob } from "@/lib/actions/jobs";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type LocationType = "Remote" | "Hybrid" | "On-site";
type StatusType = "New" | "Urgent" | "Last Call";
type TeamType = TeamOption;

interface FormState {
  title: string;
  companyName: string;
  companyLogo: string;
  team: TeamType;
  location: string;
  locationType: LocationType;
  salary: string;
  experience: string;
  description: string;
  tags: string;
  status: StatusType;
}

const emptyForm: FormState = {
  title: "",
  companyName: "",
  companyLogo: "",
  team: "Software Engineering",
  location: "",
  locationType: "Remote",
  salary: "",
  experience: "",
  description: "",
  tags: "",
  status: "New",
};

const locationTypeOptions: LocationType[] = ["Remote", "Hybrid", "On-site"];
const statusOptions: StatusType[] = ["Urgent", "New", "Last Call"];
const teamOptions: TeamType[] = [...TEAM_OPTIONS];

const JOBS_PER_PAGE = 9;
const MAIN_ADMIN_EMAIL = "admin@aibuilders.mx";

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
/*  Small custom select                                                */
/* ------------------------------------------------------------------ */
function CustomSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: T[];
  onChange: (v: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
        {label}
      </label>
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none"
        >
          <span>{value}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
          </motion.div>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
            >
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {opt === value && (
                    <Check className="h-3.5 w-3.5 text-gray-500" strokeWidth={2} />
                  )}
                  {opt !== value && <span className="w-3.5" />}
                  {opt}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Text input field                                                    */
/* ------------------------------------------------------------------ */
function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  const shared =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 placeholder:text-gray-300 transition-colors hover:border-gray-300 focus:border-gray-400 focus:outline-none";

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`${shared} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={shared}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Delete confirmation dialog                                         */
/* ------------------------------------------------------------------ */
function DeleteDialog({
  jobTitle,
  onConfirm,
  onCancel,
}: {
  jobTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
        className="mx-4 w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl sm:p-8"
      >
        <h3 className="mb-2 font-serif text-xl text-gray-700">
          Delete this role?
        </h3>
        <p className="mb-6 text-sm leading-relaxed text-gray-400">
          &ldquo;{jobTitle}&rdquo; will be permanently removed from your
          listings. This action cannot be undone.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-gray-200 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-full bg-red-500 px-5 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
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

/* ------------------------------------------------------------------ */
/*  Dashboard client component                                         */
/* ------------------------------------------------------------------ */
export function DashboardClient({ userEmail }: { userEmail: string }) {
  const [roles, setRoles] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JobData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const supabase = createClient();

  const recruiterColor = "6366f1";
  const isMainAdmin = userEmail.trim().toLowerCase() === MAIN_ADMIN_EMAIL;

  /* ── Load jobs from Supabase ── */
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);

      // Get ALL jobs (all admins see everything)
      const { data: jobs, error } = await supabase
        .from("jobs")
        .select(`
          *,
          company:companies(*)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to load jobs:", error);
      } else if (jobs) {
        setRoles(jobs.map((job) => dbToJobData(job as never)));
      }

      setLoading(false);
    }

    loadJobs();
  }, [supabase]);

  /* ── Pagination ── */
  const totalPages = Math.ceil(roles.length / JOBS_PER_PAGE);
  // Clamp during render so a deletion that shrinks the list can't leave us on a
  // now-empty page — no effect/setState needed.
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedRoles = roles.slice(
    (safePage - 1) * JOBS_PER_PAGE,
    safePage * JOBS_PER_PAGE
  );

  /* ── Helpers ── */
  const resetForm = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
  }, []);

  const openNewModal = useCallback(() => {
    setForm(emptyForm);
    setEditingId(null);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setTimeout(() => {
      setForm(emptyForm);
      setEditingId(null);
    }, 250);
  }, []);

  const flashSuccess = useCallback(() => {
    setErrorMessage(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2200);
  }, []);

  const flashError = useCallback((message: string) => {
    setShowSuccess(false);
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 3200);
  }, []);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const uploadLogo = useCallback(
    async (file: File) => {
      setIsUploadingLogo(true);
      const fileExt = file.name.split(".").pop() ?? "png";
      const path = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("company-logos")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (error || !data?.path) {
        console.error("Failed to upload logo:", error);
        setIsUploadingLogo(false);
        flashError("No se pudo subir el logo. Intenta con otra imagen.");
        return null;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("company-logos").getPublicUrl(data.path);
      setIsUploadingLogo(false);
      return publicUrl;
    },
    [supabase, flashError]
  );

  const handleLogoFileChange = useCallback(
    async (file: File | null) => {
      if (!file) return;
      const publicUrl = await uploadLogo(file);
      if (publicUrl) {
        updateField("companyLogo", publicUrl);
      }
    },
    [updateField, uploadLogo]
  );

  /* ── Handlers ── */
  const handleSubmit = useCallback(async () => {
    if (
      !form.title.trim() ||
      !form.location.trim() ||
      !form.companyName.trim() ||
      !form.description.trim()
    ) {
      flashError("La descripcion es obligatoria para publicar la vacante.");
      return;
    }

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const normalizedDescription = form.description.slice(0, 140);
    const trimmedCompanyName = form.companyName.trim();
    const fallbackLogo = `https://api.dicebear.com/9.x/initials/svg?seed=${getCompanyInitials(trimmedCompanyName)}&backgroundColor=${recruiterColor}`;

    const logoToPersist = form.companyLogo.trim() || fallbackLogo;
    const company = await getOrCreateCompany(trimmedCompanyName, logoToPersist);
    if (!company) {
      console.error("Failed to create or load company.");
      flashError("No se pudo crear o cargar la empresa.");
      return;
    }

    if (editingId) {
      const result = await updateJob(editingId, {
          company_id: company.id,
          title: form.title,
          location: form.location,
          location_type: form.locationType,
          salary: form.salary || "Competitive",
          experience: form.experience || "Not specified",
          description: normalizedDescription,
          team: form.team,
          tags: tagsArray,
          status: form.status,
        } as never);

      if ("data" in result && result.data) {
        setRoles((prev) =>
          prev.map((r) => (r.id === editingId ? dbToJobData(result.data as never) : r))
        );
      } else {
        flashError(("error" in result ? result.error : null) ?? "No se pudo actualizar la vacante.");
        return;
      }
    } else {
      const result = await createJob({
          company_id: company.id,
          title: form.title,
          location: form.location,
          location_type: form.locationType,
          salary: form.salary || "Competitive",
          experience: form.experience || "Not specified",
          description: normalizedDescription,
          team: form.team,
          tags: tagsArray,
          status: form.status,
          apply_url: "https://aibuilders.mx/jobs",
        } as never);

      if ("data" in result && result.data) {
        setRoles((prev) => [dbToJobData(result.data as never), ...prev]);
        setCurrentPage(1); // Go to first page to see new job
      } else {
        flashError(("error" in result ? result.error : null) ?? "No se pudo publicar la vacante.");
        return;
      }
    }

    setModalOpen(false);
    resetForm();
    flashSuccess();
  }, [form, editingId, resetForm, flashSuccess, flashError]);

  const handleEdit = useCallback(
    (job: JobData) => {
      setEditingId(job.id);
      const normalizedTeam = teamOptions.includes(job.team as TeamType)
        ? (job.team as TeamType)
        : "Software Engineering";
      setForm({
        title: job.title,
        companyName: job.company,
        companyLogo: job.companyLogo,
        team: normalizedTeam,
        location: job.location,
        locationType: job.locationType,
        salary: job.salary,
        experience: job.experience,
        description: job.description.slice(0, 140),
        tags: job.tags.join(", "),
        status: job.status,
      });
      setModalOpen(true);
    },
    []
  );

  const handleDelete = useCallback(async (id: string) => {
    const result = await deleteJob(id);
    if (!("error" in result)) {
      setRoles((prev) => prev.filter((r) => r.id !== id));
    } else {
      flashError(result.error || "No se pudo eliminar la vacante.");
    }
    setDeleteTarget(null);
  }, [flashError]);

  const isFormValid =
    form.title.trim() !== "" &&
    form.location.trim() !== "" &&
    form.companyName.trim() !== "" &&
    form.description.trim() !== "" &&
    !isUploadingLogo;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white px-4 py-7 sm:px-6 sm:py-10 md:px-12 lg:px-16">
        <div className="mx-auto flex max-w-7xl items-start justify-between gap-4">
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-gray-400/80">
              AIBM Recruiter Dashboard
            </p>
            <h1 className="mb-2 font-serif text-[2rem] leading-[1.1] text-gray-800 sm:text-4xl md:text-5xl">
              Gestiona tus roles.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-gray-400">
              Publica, edita y administra las posiciones abiertas de tu empresa.
            </p>
          </div>

          <div className="hidden shrink-0 items-center gap-4 sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
              {userEmail}
            </span>
            {isMainAdmin && (
              <Link
                href="/job-board/dashboard/recruiters"
                className="rounded-full border border-gray-200 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
              >
                Gestionar accesos
              </Link>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
              >
                <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                Salir
              </button>
            </form>
          </div>
        </div>

        {/* Mobile logout */}
        <div className="mt-4 flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
              {userEmail}
            </span>
            {isMainAdmin && (
              <Link
                href="/job-board/dashboard/recruiters"
                className="rounded-full border border-gray-200 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
              >
                Accesos
              </Link>
            )}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-600"
            >
              <LogOut className="h-3 w-3" strokeWidth={1.5} />
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {/* Toolbar */}
          <div className="mb-5 flex items-center gap-4 sm:mb-8">
            <div className="h-px flex-1 bg-gray-300/40" />
            <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-gray-400/70">
              <Briefcase className="h-3.5 w-3.5" strokeWidth={1.5} />
              {roles.length} {roles.length === 1 ? "Open Role" : "Open Roles"}
            </span>
            <div className="h-px flex-1 bg-gray-300/40" />
          </div>

          {/* Add Job Post button */}
          <div className="mb-8 flex justify-center sm:mb-12">
            <motion.button
              type="button"
              onClick={openNewModal}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 rounded-full bg-gray-900 px-8 py-4 font-mono text-xs font-medium uppercase tracking-[0.25em] text-white shadow-md transition-colors duration-300 hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Add Job Post
            </motion.button>
          </div>

          {/* Success toast */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-green-200 bg-green-50 px-5 py-2.5"
              >
                <Check className="h-4 w-4 text-green-500" strokeWidth={2} />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-green-600">
                  Role saved successfully
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error toast */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5"
              >
                <X className="h-4 w-4 text-red-500" strokeWidth={2} />
                <span className="font-mono text-xs uppercase tracking-[0.15em] text-red-600">
                  {errorMessage}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {roles.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-24 text-center"
            >
              <Briefcase
                className="mx-auto mb-4 h-10 w-10 text-gray-300"
                strokeWidth={1}
              />
              <p className="mb-5 text-sm text-gray-400">
                No open roles yet. Publish your first position to start
                receiving applicants.
              </p>
              <button
                type="button"
                onClick={openNewModal}
                className="font-mono text-xs uppercase tracking-[0.15em] text-gray-500 underline decoration-dotted underline-offset-4 transition-colors hover:text-gray-700"
              >
                Post your first role
              </button>
            </motion.div>
          )}

          {/* Role cards grid */}
          <div className="grid grid-cols-1 justify-items-center gap-7 sm:gap-10 md:grid-cols-2 xl:grid-cols-3">
            <AnimatePresence>
              {paginatedRoles.map((role) => (
                <motion.div
                  key={role.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <CleanLedgerCard
                    job={role}
                    onEdit={() => handleEdit(role)}
                    onDelete={() => setDeleteTarget(role)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 font-mono text-sm text-gray-500 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full font-mono text-xs transition-colors ${
                    safePage === page
                      ? "bg-gray-900 text-white"
                      : "border border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 font-mono text-sm text-gray-500 transition-colors hover:border-gray-300 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-200/60 bg-white px-5 py-8 text-center sm:px-6 sm:py-10">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-300">
          Built with Next.js, Tailwind CSS &amp; Framer Motion — AIBM 2026
        </p>
      </footer>

      {/* ── Job Post modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/25 px-4 py-10 backdrop-blur-sm sm:py-16"
            onClick={closeModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl overflow-visible rounded-2xl border border-gray-200 bg-white shadow-2xl"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex items-center gap-2.5">
                  <img
                    src={
                      form.companyLogo ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${getCompanyInitials(form.companyName || "Company")}&backgroundColor=${recruiterColor}`
                    }
                    alt={form.companyName || "Company"}
                    className="h-10 w-10 rounded-xl"
                  />
                  <div>
                    <span className="text-sm text-gray-400">
                      {form.companyName || "Nombre de la empresa"}
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-300">
                      {editingId ? "Editing role" : "New role"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden items-center gap-1.5 sm:flex">
                    {statusOptions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => updateField("status", s)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-all ${
                          form.status === s
                            ? "border-gray-400 bg-gray-100 text-gray-600"
                            : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            s === "Urgent"
                              ? "bg-blue-400"
                              : s === "Last Call"
                                ? "bg-orange-400"
                                : "bg-green-400"
                          }`}
                        />
                        {s}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                  >
                    <X className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                  </button>
                </div>
              </div>

              {/* Mobile status pills */}
              <div className="flex items-center gap-1.5 border-b border-gray-100 px-5 py-3 sm:hidden">
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => updateField("status", s)}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] transition-all ${
                      form.status === s
                        ? "border-gray-400 bg-gray-100 text-gray-600"
                        : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        s === "Urgent"
                          ? "bg-blue-400"
                          : s === "Last Call"
                            ? "bg-orange-400"
                            : "bg-green-400"
                      }`}
                    />
                    {s}
                  </button>
                ))}
              </div>

              {/* Role title */}
              <div className="px-5 pt-6 pb-2 sm:px-8 sm:pt-8 sm:pb-3">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Role title, e.g. Senior AI Engineer"
                  className="w-full border-none bg-transparent font-serif text-2xl text-gray-700 placeholder:text-gray-300 focus:outline-none sm:text-3xl"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div className="px-5 pb-6 sm:px-8 sm:pb-8">
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value.slice(0, 140))}
                  placeholder="Brief description of the role and responsibilities..."
                  maxLength={140}
                  className={`w-full resize-none border-none bg-transparent text-sm leading-relaxed placeholder:text-gray-300 focus:outline-none sm:text-base ${
                    form.description.length >= 140 ? "text-amber-600" : "text-gray-500"
                  }`}
                />
                <p
                  className={`mt-2 text-right font-mono text-[10px] uppercase tracking-[0.15em] ${
                    form.description.length >= 140 ? "text-amber-500" : "text-gray-300"
                  }`}
                >
                  {form.description.length}/140
                </p>
                {form.description.length >= 140 && (
                  <p className="mt-1 text-right text-xs text-amber-500">
                    Limite de 140 caracteres alcanzado.
                  </p>
                )}
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2 sm:gap-5 sm:px-8 sm:pb-6">
                <Field
                  label="Company Name"
                  value={form.companyName}
                  onChange={(v) => updateField("companyName", v)}
                  placeholder="e.g. AI Builders MX"
                />
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                    Company Logo
                  </label>
                  <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 transition-colors hover:border-gray-300">
                    <span className="truncate">
                      {isUploadingLogo
                        ? "Uploading..."
                        : form.companyLogo
                          ? "Logo uploaded"
                          : "Upload logo image"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        void handleLogoFileChange(e.target.files?.[0] ?? null);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <Field
                  label="Location"
                  value={form.location}
                  onChange={(v) => updateField("location", v)}
                  placeholder="e.g. CDMX, Mexico"
                />
                <CustomSelect
                  label="Location Type"
                  value={form.locationType}
                  options={locationTypeOptions}
                  onChange={(v) => updateField("locationType", v)}
                />
                <Field
                  label="Salary Range"
                  value={form.salary}
                  onChange={(v) => updateField("salary", v)}
                  placeholder="e.g. $80,000 – $120,000 USD"
                />
                <Field
                  label="Experience"
                  value={form.experience}
                  onChange={(v) => updateField("experience", v)}
                  placeholder="e.g. 5+ years"
                />
                <CustomSelect
                  label="Team"
                  value={form.team}
                  options={teamOptions}
                  onChange={(v) => updateField("team", v)}
                />
              </div>

              {/* Tags */}
              <div className="px-5 pb-5 sm:px-8 sm:pb-6">
                <Field
                  label="Skills / Tags (comma-separated)"
                  value={form.tags}
                  onChange={(v) => updateField("tags", v)}
                  placeholder="e.g. Python, PyTorch, LLMs, MLOps"
                />

                {form.tags.trim() && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {form.tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-gray-200 bg-white px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Action bar */}
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/80 px-5 py-5 sm:px-8 sm:py-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.15em] text-gray-400 transition-colors hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Cancel
                </button>

                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  whileTap={isFormValid ? { scale: 0.97 } : undefined}
                  className={`inline-flex items-center gap-2.5 rounded-full px-8 py-4 font-mono text-xs font-medium uppercase tracking-[0.25em] text-white transition-all duration-300 ${
                    isFormValid
                      ? "bg-gray-900 hover:bg-gray-800"
                      : "cursor-not-allowed bg-gray-300"
                  }`}
                >
                  {editingId ? (
                    <>
                      <Check className="h-4 w-4" strokeWidth={2} />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" strokeWidth={2} />
                      Publish Role
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Delete confirmation modal ── */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteDialog
            jobTitle={deleteTarget.title}
            onConfirm={() => handleDelete(deleteTarget.id)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
