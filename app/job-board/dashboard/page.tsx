"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { CleanLedgerCard } from "@/components/job-board/cards/clean-ledger-card";
import type { JobData } from "@/components/job-board/job-data";
import { AnimatePresence, motion } from "framer-motion";
import {
  Plus,
  X,
  Briefcase,
  ChevronDown,
  Check,
  Upload,
  Image as ImageIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Seed roles – the recruiter's existing mock listings                */
/* ------------------------------------------------------------------ */
const seedRoles: JobData[] = [
  {
    id: "JB-2026-0201",
    title: "Senior AI Engineer",
    company: "NeuralForge Labs",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=NF&backgroundColor=6366f1",
    location: "San Francisco, CA",
    locationType: "Hybrid",
    salary: "$185,000 – $240,000",
    experience: "5+ years",
    description:
      "Build and deploy large language models at scale. Lead a team of ML engineers working on next-gen foundation models.",
    applyUrl: "#",
    tags: ["Python", "PyTorch", "LLMs", "MLOps"],
    status: "New",
    postedAt: "2 days ago",
  },
  {
    id: "JB-2026-0202",
    title: "Staff Frontend Engineer",
    company: "NeuralForge Labs",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=NF&backgroundColor=6366f1",
    location: "New York, NY",
    locationType: "Remote",
    salary: "$195,000 – $260,000",
    experience: "7+ years",
    description:
      "Architect design systems and craft WebGL-powered experiences. Shape the future of our product interface and creative tools.",
    applyUrl: "#",
    tags: ["React", "TypeScript", "WebGL", "Design Systems"],
    status: "Urgent",
    postedAt: "5 hours ago",
  },
  {
    id: "JB-2026-0203",
    title: "DevOps & Platform Lead",
    company: "NeuralForge Labs",
    companyLogo:
      "https://api.dicebear.com/9.x/initials/svg?seed=NF&backgroundColor=6366f1",
    location: "Austin, TX",
    locationType: "Hybrid",
    salary: "$175,000 – $225,000",
    experience: "6+ years",
    description:
      "Own the infrastructure that powers millions of developer sessions. Build resilient CI/CD pipelines and scale Kubernetes clusters.",
    applyUrl: "#",
    tags: ["Kubernetes", "Terraform", "AWS", "CI/CD"],
    status: "Closing Soon",
    postedAt: "1 week ago",
  },
];

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
type LocationType = "Remote" | "Hybrid" | "On-site";
type StatusType = "New" | "Urgent" | "Closing Soon";

interface FormState {
  title: string;
  companyLogo: string;
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
  companyLogo: "",
  location: "",
  locationType: "Remote",
  salary: "",
  experience: "",
  description: "",
  tags: "",
  status: "New",
};

const locationTypeOptions: LocationType[] = ["Remote", "Hybrid", "On-site"];
const statusOptions: StatusType[] = ["New", "Urgent", "Closing Soon"];

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
              className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
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
/*  Dashboard page                                                      */
/* ------------------------------------------------------------------ */
export default function DashboardPage() {
  const [roles, setRoles] = useState<JobData[]>(seedRoles);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<JobData | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ── Mock recruiter info ── */
  const recruiterCompany = "NeuralForge Labs";
  const recruiterInitials = "NF";
  const recruiterColor = "6366f1";

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
    // Small delay so the exit animation plays before resetting
    setTimeout(() => {
      setForm(emptyForm);
      setEditingId(null);
    }, 250);
  }, []);

  const flashSuccess = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2200);
  }, []);

  const updateField = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /* ── Handlers ── */
  const handleSubmit = useCallback(() => {
    if (!form.title.trim() || !form.location.trim()) return;

    const tagsArray = form.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editingId) {
      // Update existing
      setRoles((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? {
                ...r,
                title: form.title,
                companyLogo: form.companyLogo || r.companyLogo,
                location: form.location,
                locationType: form.locationType,
                salary: form.salary || "Undisclosed",
                experience: form.experience || "Not specified",
                description: form.description,
                tags: tagsArray,
                status: form.status,
              }
            : r
        )
      );
    } else {
      // Add new
      const defaultLogo = `https://api.dicebear.com/9.x/initials/svg?seed=${recruiterInitials}&backgroundColor=${recruiterColor}`;
      const newRole: JobData = {
        id: `JB-2026-${String(Date.now()).slice(-4)}`,
        title: form.title,
        company: recruiterCompany,
        companyLogo: form.companyLogo || defaultLogo,
        location: form.location,
        locationType: form.locationType,
        salary: form.salary || "Undisclosed",
        experience: form.experience || "Not specified",
        description: form.description,
        applyUrl: "#",
        tags: tagsArray,
        status: form.status,
        postedAt: "Just now",
      };
      setRoles((prev) => [newRole, ...prev]);
    }

    setModalOpen(false);
    resetForm();
    flashSuccess();
  }, [form, editingId, recruiterCompany, recruiterInitials, recruiterColor, resetForm, flashSuccess]);

  const handleEdit = useCallback(
    (job: JobData) => {
      setEditingId(job.id);
      setForm({
        title: job.title,
        companyLogo: job.companyLogo,
        location: job.location,
        locationType: job.locationType,
        salary: job.salary,
        experience: job.experience,
        description: job.description,
        tags: job.tags.join(", "),
        status: job.status,
      });
      setModalOpen(true);
    },
    []
  );

  const handleDelete = useCallback((id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    setDeleteTarget(null);
  }, []);

  const isFormValid = form.title.trim() !== "" && form.location.trim() !== "";

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
              Publica, edita y administra las posiciones abiertas de{" "}
              <span className="font-medium text-gray-500">{recruiterCompany}</span>.
            </p>
          </div>

          <a
            href="https://aibuilders.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden shrink-0 sm:block"
          >
            <img
              src="/aibm-logo.svg"
              alt="AIBM"
              className="h-5 w-auto brightness-0 sm:h-6"
            />
          </a>
        </div>
      </header>

      <main className="px-4 py-6 sm:px-6 sm:py-10 md:px-12 lg:px-16">
        <div className="mx-auto max-w-7xl">
          {/* ============================================================ */}
          {/*  Your Open Roles                                              */}
          {/* ============================================================ */}

          {/* Toolbar: section label + Add button */}
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
                  Role published successfully
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
              {roles.map((role) => (
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
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
            >
              {/* Modal header – company info + status + close */}
              <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/80 px-5 py-5 sm:px-8 sm:py-6">
                <div className="flex items-center gap-2.5">
                  <img
                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${recruiterInitials}&backgroundColor=${recruiterColor}`}
                    alt={recruiterCompany}
                    className="h-10 w-10 rounded-xl"
                  />
                  <div>
                    <span className="text-sm text-gray-400">
                      {recruiterCompany}
                    </span>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-300">
                      {editingId ? "Editing role" : "New role"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status pills – hidden on very small screens, shown on sm+ */}
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
                              : s === "Closing Soon"
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

              {/* Mobile-only status pills */}
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
                          : s === "Closing Soon"
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
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Brief description of the role and responsibilities..."
                  className="w-full resize-none border-none bg-transparent text-sm leading-relaxed text-gray-500 placeholder:text-gray-300 focus:outline-none sm:text-base"
                />
              </div>

              {/* Company Logo Upload */}
              <div className="px-5 pb-5 sm:px-8 sm:pb-6">
                <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  Company Logo (JPG/PNG)
                </label>
                <div className="flex items-center gap-4">
                  {/* Logo preview */}
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {form.companyLogo ? (
                      <img
                        src={form.companyLogo}
                        alt="Company logo"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-300" strokeWidth={1.5} />
                    )}
                  </div>
                  
                  {/* Upload button */}
                  <div className="flex flex-1 flex-col gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700">
                      <Upload className="h-4 w-4" strokeWidth={1.5} />
                      <span>Upload logo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              updateField("companyLogo", reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <p className="font-mono text-[10px] text-gray-300">
                      Max 2MB • Square recommended
                    </p>
                  </div>

                  {/* Remove button */}
                  {form.companyLogo && (
                    <button
                      type="button"
                      onClick={() => updateField("companyLogo", "")}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-gray-100"
                    >
                      <X className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 gap-4 px-5 pb-5 sm:grid-cols-2 sm:gap-5 sm:px-8 sm:pb-6">
                <Field
                  label="Location"
                  value={form.location}
                  onChange={(v) => updateField("location", v)}
                  placeholder="e.g. San Francisco, CA"
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
                  placeholder="e.g. $150,000 – $200,000"
                />
                <Field
                  label="Experience"
                  value={form.experience}
                  onChange={(v) => updateField("experience", v)}
                  placeholder="e.g. 5+ years"
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

                {/* Tag preview */}
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
