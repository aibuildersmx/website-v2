"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { newsletterIssues } from "@/lib/db/schema";
import { getUser } from "@/lib/auth";
import type { Issue } from "@/lib/newsletter/types";
import { emptyIssue } from "@/lib/newsletter/issue";
import { renderBuildLog } from "@/lib/newsletter/render";
import { buildBroadcastPayload } from "@/lib/newsletter/broadcast";
import { loadNewsletterConfig, MissingEnvError } from "@/lib/newsletter/resend";

const LIST_PATH = "/admin/newsletter";

type ActionError = { error: string };
type ActionOk = { ok: true; message?: string };

async function gate(): Promise<ActionError | null> {
  const user = await getUser();
  if (!user) return { error: "No autorizado." };
  return null;
}

// Replace Resend's unsubscribe placeholder so previews/tests render a real (no-op)
// link instead of a literal token. The real token is only injected by Resend
// when it sends an actual broadcast.
function previewHtml(issue: Issue): string {
  return renderBuildLog(issue).replace(/\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/g, "#");
}

export interface IssueListItem {
  id: string;
  slug: string;
  subject: string;
  status: string;
  sentAt: Date | null;
  updatedAt: Date;
}

export async function listIssues(): Promise<IssueListItem[]> {
  if (await gate()) return [];
  const rows = await db
    .select({
      id: newsletterIssues.id,
      slug: newsletterIssues.slug,
      subject: newsletterIssues.subject,
      status: newsletterIssues.status,
      sentAt: newsletterIssues.sentAt,
      updatedAt: newsletterIssues.updatedAt,
    })
    .from(newsletterIssues)
    .orderBy(desc(newsletterIssues.updatedAt));
  return rows;
}

export interface IssueDetail {
  id: string;
  slug: string;
  status: string;
  resendBroadcastId: string | null;
  sentAt: Date | null;
  data: Issue;
}

export async function getIssue(id: string): Promise<IssueDetail | null> {
  if (await gate()) return null;
  const rows = await db
    .select()
    .from(newsletterIssues)
    .where(eq(newsletterIssues.id, id))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    resendBroadcastId: row.resendBroadcastId,
    sentAt: row.sentAt,
    data: row.data,
  };
}

// Next slug = max existing numeric slug + 1, zero-padded to 3 digits.
function nextSlug(existing: string[]): string {
  const max = existing.reduce((m, s) => {
    const n = parseInt(s, 10);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return String(max + 1).padStart(3, "0");
}

export async function createIssue(): Promise<void> {
  if (await gate()) return;
  const slugs = await db
    .select({ slug: newsletterIssues.slug })
    .from(newsletterIssues);
  const slug = nextSlug(slugs.map((r) => r.slug));
  const data = emptyIssue(slug);
  const inserted = await db
    .insert(newsletterIssues)
    .values({ slug, subject: data.subject, status: "draft", data })
    .returning({ id: newsletterIssues.id });
  revalidatePath(LIST_PATH);
  redirect(`${LIST_PATH}/${inserted[0].id}`);
}

export async function saveIssue(
  id: string,
  data: Issue,
): Promise<ActionOk | ActionError> {
  if (await gate()) return { error: "No autorizado." };
  // Keep the row's denormalized columns in sync with the canonical Issue JSON.
  await db
    .update(newsletterIssues)
    .set({
      data,
      slug: data.slug,
      subject: data.subject,
      updatedAt: new Date(),
    })
    .where(eq(newsletterIssues.id, id));
  revalidatePath(`${LIST_PATH}/${id}`);
  revalidatePath(LIST_PATH);
  return { ok: true };
}

// Server-rendered preview HTML for the composer's iframe. Always reflects the
// data the client passes (which may be unsaved).
export async function renderPreview(data: Issue): Promise<string> {
  if (await gate()) return "<!doctype html><title>No autorizado</title>";
  return previewHtml(data);
}

export async function sendTest(
  data: Issue,
  email: string,
): Promise<ActionOk | ActionError> {
  if (await gate()) return { error: "No autorizado." };
  const to = email.trim().toLowerCase();
  if (!to.includes("@")) return { error: "Ingresa un correo válido." };
  if (!data.subject.trim()) return { error: "El issue necesita un subject antes de enviar." };

  let cfg;
  try {
    cfg = loadNewsletterConfig();
  } catch (e) {
    if (e instanceof MissingEnvError) return { error: e.message };
    throw e;
  }

  const res = await cfg.resend.emails.send({
    from: cfg.from,
    to: [to],
    subject: `[TEST] ${data.subject}`,
    html: previewHtml(data),
    replyTo: cfg.replyTo,
  });
  if (res.error) return { error: `Envío de prueba falló: ${res.error.message}` };
  return { ok: true, message: `Prueba enviada a ${to}.` };
}

export async function sendBroadcast(
  id: string,
): Promise<ActionOk | ActionError> {
  if (await gate()) return { error: "No autorizado." };

  const detail = await getIssue(id);
  if (!detail) return { error: "Issue no encontrado." };
  if (detail.status === "sent") return { error: "Este issue ya fue enviado." };

  const data = detail.data;
  if (!data.subject.trim()) return { error: "El issue necesita un subject." };
  if (!data.stories.length) return { error: "Agrega al menos una historia antes de enviar." };

  let cfg;
  try {
    cfg = loadNewsletterConfig({ requireAudience: true });
  } catch (e) {
    if (e instanceof MissingEnvError) return { error: e.message };
    throw e;
  }

  const payload = buildBroadcastPayload(data, renderBuildLog(data), {
    audienceId: cfg.audienceId!,
    from: cfg.from,
    replyTo: cfg.replyTo,
  });
  const created = await cfg.resend.broadcasts.create(payload);
  if (created.error || !created.data) {
    return { error: `No se pudo crear el broadcast: ${created.error?.message}` };
  }
  const sent = await cfg.resend.broadcasts.send(created.data.id);
  if (sent.error) {
    return { error: `No se pudo enviar el broadcast: ${sent.error.message}` };
  }

  await db
    .update(newsletterIssues)
    .set({
      status: "sent",
      resendBroadcastId: created.data.id,
      sentAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(newsletterIssues.id, id));
  revalidatePath(`${LIST_PATH}/${id}`);
  revalidatePath(LIST_PATH);
  return { ok: true, message: `Broadcast "${payload.name}" enviado.` };
}

// --- Phase 4 seam (NOT wired yet) -------------------------------------------
// AI-assisted editing will land here as a server action that mutates a single
// section of the Issue and returns the updated Issue:
//
//   export async function enhanceSection(id: string, section: keyof Issue,
//     instruction: string): Promise<Issue | ActionError>
//
// It will call the Anthropic SDK with the section's current JSON + instruction,
// validate the model's output against the Issue type, persist via saveIssue, and
// return the new Issue. The same function is intended to be wrapped 1:1 as an MCP
// tool so an agent edits issues through the exact same door as the panel.
// Deliberately omitted in Phase 3 — the panel ships humans-only first.
