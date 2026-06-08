"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type {
  Issue,
  Story,
  UseCase,
  EventItem,
  JobItem,
} from "@/lib/newsletter/types";
import {
  saveIssue,
  sendTest,
  sendBroadcast,
  renderPreview,
} from "@/lib/actions/newsletter";

// --- small immutable helpers ------------------------------------------------
function replaceAt<T>(arr: T[], i: number, val: T): T[] {
  return arr.map((x, idx) => (idx === i ? val : x));
}
function removeAt<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

// --- inline field primitives (Notion-ish: borderless until focus) -----------
function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400">
      {children}
    </span>
  );
}

const inputCls =
  "w-full bg-transparent text-gray-800 outline-none border-b border-transparent hover:border-black/10 focus:border-black/40 transition py-1 placeholder:text-gray-300";

function TextField({
  label,
  value,
  onChange,
  placeholder,
  mono,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${mono ? "font-mono text-xs" : "text-[15px]"}`}
      />
    </label>
  );
}

function AreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        value={value}
        placeholder={placeholder}
        rows={2}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} resize-none [field-sizing:content] text-[15px] leading-relaxed`}
      />
    </label>
  );
}

// --- section block wrapper --------------------------------------------------
function Block({
  index,
  title,
  onAdd,
  addLabel,
  children,
}: {
  index: string;
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-6">
      <div className="mb-5 flex items-center justify-between gap-4 border-b border-black/5 pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gray-300">
            {index}
          </p>
          <h2 className="font-serif text-xl text-gray-800">{title}</h2>
        </div>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="shrink-0 rounded-full border border-black/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-600 transition hover:border-black/30 hover:text-gray-900"
          >
            {addLabel ?? "+ Añadir"}
          </button>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function Item({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-stone-50/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-gray-400">
          {label}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-300 transition hover:text-red-500"
        >
          Quitar
        </button>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// --- main editor ------------------------------------------------------------
type SaveState = "idle" | "saving" | "saved" | "error";

export function IssueEditor({
  id,
  initialData,
  status: initialStatus,
  resendBroadcastId: initialBroadcastId,
}: {
  id: string;
  initialData: Issue;
  status: string;
  resendBroadcastId: string | null;
}) {
  const [issue, setIssue] = useState<Issue>(initialData);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [status, setStatus] = useState(initialStatus);
  const [broadcastId] = useState(initialBroadcastId);
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [isPending, startTransition] = useTransition();

  const firstRender = useRef(true);
  const sent = status === "sent";

  // Debounced autosave whenever the issue changes (skip the first render).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setSaveState("saving");
    const t = setTimeout(async () => {
      const res = await saveIssue(id, issue);
      setSaveState("error" in res ? "error" : "saved");
    }, 1000);
    return () => clearTimeout(t);
  }, [id, issue]);

  const refreshPreview = useCallback(() => {
    startTransition(async () => {
      const html = await renderPreview(issue);
      setSrcDoc(html);
    });
  }, [issue]);

  // Initial preview on mount.
  useEffect(() => {
    refreshPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // mutation helpers
  const patch = (p: Partial<Issue>) => setIssue((prev) => ({ ...prev, ...p }));
  const patchEssay = (p: Partial<Issue["essay"]>) =>
    setIssue((prev) => ({ ...prev, essay: { ...prev.essay, ...p } }));
  const patchCommunity = (p: Partial<Issue["community"]>) =>
    setIssue((prev) => ({ ...prev, community: { ...prev.community, ...p } }));

  async function onSendTest() {
    setMessage(null);
    const res = await sendTest(issue, testEmail);
    setMessage(
      "error" in res
        ? { kind: "err", text: res.error }
        : { kind: "ok", text: res.message ?? "Prueba enviada." },
    );
  }

  async function onSendBroadcast() {
    if (!window.confirm("¿Enviar este issue a TODA la audiencia? No se puede deshacer.")) return;
    setMessage(null);
    const res = await sendBroadcast(id);
    if ("error" in res) {
      setMessage({ kind: "err", text: res.error });
    } else {
      setStatus("sent");
      setMessage({ kind: "ok", text: res.message ?? "Broadcast enviado." });
    }
  }

  const saveText =
    saveState === "saving"
      ? "Guardando…"
      : saveState === "saved"
        ? "Guardado"
        : saveState === "error"
          ? "Error al guardar"
          : "";

  return (
    <div className="mt-4">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 -mx-4 mb-6 flex flex-wrap items-center gap-3 border-b border-black/5 bg-stone-100/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="font-serif text-lg text-gray-800">Issue {issue.slug}</span>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] ${
              sent ? "bg-green-500/10 text-green-700" : "bg-black/5 text-gray-500"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${sent ? "bg-green-500" : "bg-black/20"}`} />
            {sent ? "Enviado" : "Borrador"}
          </span>
        </div>

        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-400">
          {saveText}
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={refreshPreview}
            disabled={isPending}
            className="rounded-full border border-black/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-600 transition hover:border-black/30 disabled:opacity-50"
          >
            {isPending ? "…" : "Actualizar vista"}
          </button>
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="tu@correo.com"
            className="w-40 rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-black/40"
          />
          <button
            type="button"
            onClick={onSendTest}
            className="rounded-full border border-black/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gray-600 transition hover:border-black/30"
          >
            Enviar prueba
          </button>
          <button
            type="button"
            onClick={onSendBroadcast}
            disabled={sent}
            className="rounded-full bg-gray-900 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {sent ? "Enviado" : "Enviar broadcast"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            message.kind === "ok"
              ? "border-green-500/20 bg-green-500/5 text-green-700"
              : "border-red-500/20 bg-red-500/5 text-red-600"
          }`}
        >
          {message.text}
          {broadcastId && message.kind === "ok" && (
            <span className="ml-2 font-mono text-[10px] text-gray-400">
              ({broadcastId})
            </span>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,460px)]">
        {/* Editor column */}
        <div className="space-y-6">
          <Block index="Meta" title="Encabezado">
            <TextField label="Subject (asunto del correo)" value={issue.subject} onChange={(v) => patch({ subject: v })} placeholder="The Build Log · Issue 003 — …" />
            <AreaField label="Preview (texto de inbox)" value={issue.preview} onChange={(v) => patch({ preview: v })} />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Slug" value={issue.slug} onChange={(v) => patch({ slug: v })} mono />
              <TextField label="Issue label" value={issue.issueLabel} onChange={(v) => patch({ issueLabel: v })} mono />
              <TextField label="Fecha" value={issue.date} onChange={(v) => patch({ date: v })} placeholder="07 Jun 2026" mono />
              <TextField label="Tiempo de lectura" value={issue.readingTime} onChange={(v) => patch({ readingTime: v })} mono />
            </div>
            <TextField label="Título" value={issue.title} onChange={(v) => patch({ title: v })} />
            <AreaField label="Subtítulo" value={issue.subtitle} onChange={(v) => patch({ subtitle: v })} />
          </Block>

          <Block
            index="01 / 05"
            title="Esta semana en IA"
            addLabel="+ Historia"
            onAdd={() =>
              patch({
                stories: [...issue.stories, { eyebrow: "", title: "", href: "", body: "" } as Story],
              })
            }
          >
            {issue.stories.length === 0 && <p className="text-sm text-gray-300">Sin historias todavía.</p>}
            {issue.stories.map((s, i) => (
              <Item key={i} label={`Historia ${i + 1}`} onRemove={() => patch({ stories: removeAt(issue.stories, i) })}>
                <TextField label="Eyebrow" value={s.eyebrow} onChange={(v) => patch({ stories: replaceAt(issue.stories, i, { ...s, eyebrow: v }) })} placeholder="01 · Desarrollo" mono />
                <TextField label="Título" value={s.title} onChange={(v) => patch({ stories: replaceAt(issue.stories, i, { ...s, title: v }) })} />
                <TextField label="Link" value={s.href} onChange={(v) => patch({ stories: replaceAt(issue.stories, i, { ...s, href: v }) })} placeholder="https://…" mono />
                <AreaField label="Cuerpo" value={s.body} onChange={(v) => patch({ stories: replaceAt(issue.stories, i, { ...s, body: v }) })} placeholder="Por qué importa: …" />
              </Item>
            ))}
          </Block>

          <Block index="02 / 05" title="Pensamiento de la semana">
            <TextField label="Eyebrow" value={issue.essay.eyebrow} onChange={(v) => patchEssay({ eyebrow: v })} mono />
            <TextField label="Título" value={issue.essay.title} onChange={(v) => patchEssay({ title: v })} />
            <AreaField label="Cuerpo" value={issue.essay.body} onChange={(v) => patchEssay({ body: v })} />
            <div className="grid grid-cols-2 gap-4">
              <TextField label="Autor" value={issue.essay.author} onChange={(v) => patchEssay({ author: v })} />
              <TextField label="Rol del autor" value={issue.essay.authorRole} onChange={(v) => patchEssay({ authorRole: v })} />
              <TextField label="Texto del link" value={issue.essay.linkText} onChange={(v) => patchEssay({ linkText: v })} />
              <TextField label="Link" value={issue.essay.linkHref} onChange={(v) => patchEssay({ linkHref: v })} placeholder="https://…" mono />
            </div>
          </Block>

          <Block
            index="03 / 05"
            title="En qué estamos usando IA"
            addLabel="+ Caso"
            onAdd={() => patch({ useCases: [...issue.useCases, { icon: "", title: "", body: "" } as UseCase] })}
          >
            {issue.useCases.length === 0 && <p className="text-sm text-gray-300">Sin casos todavía.</p>}
            {issue.useCases.map((u, i) => (
              <Item key={i} label={`Caso ${i + 1}`} onRemove={() => patch({ useCases: removeAt(issue.useCases, i) })}>
                <TextField label="Ícono (un glifo)" value={u.icon} onChange={(v) => patch({ useCases: replaceAt(issue.useCases, i, { ...u, icon: v }) })} placeholder="⌁" mono />
                <TextField label="Título" value={u.title} onChange={(v) => patch({ useCases: replaceAt(issue.useCases, i, { ...u, title: v }) })} />
                <AreaField label="Cuerpo" value={u.body} onChange={(v) => patch({ useCases: replaceAt(issue.useCases, i, { ...u, body: v }) })} />
              </Item>
            ))}
          </Block>

          <Block
            index="04 / 05"
            title="Próximos eventos"
            addLabel="+ Evento"
            onAdd={() => patch({ events: [...issue.events, { day: "", month: "", label: "", title: "", body: "", href: "" } as EventItem] })}
          >
            {issue.events.length === 0 && <p className="text-sm text-gray-300">Sin eventos todavía.</p>}
            {issue.events.map((e, i) => (
              <Item key={i} label={`Evento ${i + 1}`} onRemove={() => patch({ events: removeAt(issue.events, i) })}>
                <div className="grid grid-cols-3 gap-4">
                  <TextField label="Día" value={e.day} onChange={(v) => patch({ events: replaceAt(issue.events, i, { ...e, day: v }) })} placeholder="18" mono />
                  <TextField label="Mes" value={e.month} onChange={(v) => patch({ events: replaceAt(issue.events, i, { ...e, month: v }) })} placeholder="Jun" mono />
                  <TextField label="Etiqueta" value={e.label} onChange={(v) => patch({ events: replaceAt(issue.events, i, { ...e, label: v }) })} placeholder="AIBM · Online" mono />
                </div>
                <TextField label="Título" value={e.title} onChange={(v) => patch({ events: replaceAt(issue.events, i, { ...e, title: v }) })} />
                <AreaField label="Cuerpo" value={e.body} onChange={(v) => patch({ events: replaceAt(issue.events, i, { ...e, body: v }) })} />
                <TextField label="Link" value={e.href} onChange={(v) => patch({ events: replaceAt(issue.events, i, { ...e, href: v }) })} placeholder="https://…" mono />
              </Item>
            ))}
          </Block>

          <Block index="05 / 05" title="Comunidad">
            <TextField label="Etiqueta" value={issue.community.label} onChange={(v) => patchCommunity({ label: v })} mono />
            <TextField label="Título" value={issue.community.title} onChange={(v) => patchCommunity({ title: v })} />
            <TextField label="Sufijo del título" value={issue.community.titleSuffix} onChange={(v) => patchCommunity({ titleSuffix: v })} />
            <AreaField label="Cuerpo" value={issue.community.body} onChange={(v) => patchCommunity({ body: v })} />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <Label>Stats (una línea por punto)</Label>
                <button
                  type="button"
                  onClick={() => patchCommunity({ stats: [...issue.community.stats, ""] })}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 hover:text-gray-900"
                >
                  + Línea
                </button>
              </div>
              <div className="space-y-2">
                {issue.community.stats.map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={line}
                      onChange={(e) => patchCommunity({ stats: replaceAt(issue.community.stats, i, e.target.value) })}
                      className={inputCls + " text-[15px]"}
                    />
                    <button
                      type="button"
                      onClick={() => patchCommunity({ stats: removeAt(issue.community.stats, i) })}
                      className="shrink-0 font-mono text-[10px] uppercase text-gray-300 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-black/5 pt-5">
              <div className="mb-2 flex items-center justify-between">
                <Label>Empleos</Label>
                <button
                  type="button"
                  onClick={() => patch({ jobs: [...issue.jobs, { label: "", title: "", meta: "", href: "" } as JobItem] })}
                  className="font-mono text-[10px] uppercase tracking-[0.15em] text-gray-500 hover:text-gray-900"
                >
                  + Empleo
                </button>
              </div>
              <div className="space-y-3">
                {issue.jobs.map((j, i) => (
                  <Item key={i} label={`Empleo ${i + 1}`} onRemove={() => patch({ jobs: removeAt(issue.jobs, i) })}>
                    <TextField label="Etiqueta" value={j.label} onChange={(v) => patch({ jobs: replaceAt(issue.jobs, i, { ...j, label: v }) })} placeholder="Contratando" mono />
                    <TextField label="Título" value={j.title} onChange={(v) => patch({ jobs: replaceAt(issue.jobs, i, { ...j, title: v }) })} />
                    <TextField label="Meta" value={j.meta} onChange={(v) => patch({ jobs: replaceAt(issue.jobs, i, { ...j, meta: v }) })} placeholder="Freelance · remoto LatAm" />
                    <TextField label="Link" value={j.href} onChange={(v) => patch({ jobs: replaceAt(issue.jobs, i, { ...j, href: v }) })} placeholder="https://…" mono />
                  </Item>
                ))}
              </div>
            </div>
          </Block>
        </div>

        {/* Preview column */}
        <div className="lg:sticky lg:top-20 lg:h-[calc(100vh-7rem)]">
          <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-black/10 bg-black">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                Vista previa
              </span>
              <span className="font-mono text-[10px] text-white/30">email</span>
            </div>
            <iframe
              title="Vista previa del email"
              srcDoc={srcDoc}
              className="h-[640px] w-full flex-1 bg-black lg:h-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
