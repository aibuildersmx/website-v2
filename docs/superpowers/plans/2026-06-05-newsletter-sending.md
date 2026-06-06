# Newsletter Sending Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Send "The Build Log" newsletter issues to our subscriber list via Resend Broadcasts (native unsubscribe + open/click tracking), driven by a versioned CLI under `scripts/newsletter/`, with no dependency on Vercel or the paused Supabase project.

**Architecture:** A standalone TypeScript CLI (run with `tsx`) that (1) imports a Beehiiv CSV into a Resend Audience, (2) renders an email-safe Build Log HTML from typed per-issue data, and (3) creates + sends a Resend Broadcast, plus a stats command. Pure logic (CSV parsing, HTML rendering, payload building) is unit-tested with vitest; network commands are verified manually via `--dry-run` and `--test`.

**Tech Stack:** TypeScript, `tsx` (runner), `vitest` (tests), `resend` (SDK), `csv-parse` (CSV), Node 22 native env loading (`process.loadEnvFile`).

---

## Design reference

Spec: [docs/superpowers/specs/2026-06-05-newsletter-sending-design.md](../specs/2026-06-05-newsletter-sending-design.md). Source content to port: `/Users/vellent/Downloads/index.html` (The Build Log, Issue 002).

## File Structure

```
scripts/newsletter/
  .env.example              # documents RESEND_API_KEY, RESEND_AUDIENCE_ID, NEWSLETTER_FROM, NEWSLETTER_REPLY_TO
  README.md                 # how to run each command (operator runbook)
  issues/
    types.ts                # Issue + sub-types (shared by template + future web archive)
    002-the-build-log.ts    # Issue 002 data, ported from Downloads/index.html
  templates/
    build-log.ts            # renderBuildLog(issue) -> email-safe HTML string
  lib/
    env.ts                  # loadEnv() + getResend() (fail-fast on missing key)
    subscribers.ts          # parseSubscribers(csv) -> { valid, errors }
    broadcast.ts            # buildBroadcastPayload(issue, html, opts) -> payload
  import-audience.ts        # CLI: CSV -> Resend Audience contacts (idempotent)
  send-broadcast.ts         # CLI: render issue -> test | dry-run | send broadcast
  stats.ts                  # CLI: print delivered/opened/clicked summary for an issue
tests/newsletter/
  subscribers.test.ts
  build-log.test.ts
  broadcast.test.ts
```

> Note on the spec's file list: the spec sketched `templates/build-log.tsx` + `lib/render.ts`. We use a plain `.ts` string-rendering module (`templates/build-log.ts`) and skip React Email — fewer dependencies, simpler, identical output. No behavior is lost.

---

## Task 0: Scaffolding, dependencies, and scripts

**Files:**
- Modify: `package.json` (add deps + scripts)
- Create: `scripts/newsletter/.env.example`
- Create: `vitest.config.ts`
- Modify: `.gitignore` (explicit newsletter env rule)

- [ ] **Step 1: Install dependencies**

Run:
```bash
pnpm add resend
pnpm add -D tsx vitest csv-parse
```
Expected: both complete, `package.json` gains `resend` under dependencies and `tsx`, `vitest`, `csv-parse` under devDependencies.

- [ ] **Step 2: Add npm scripts**

Edit `package.json` `"scripts"` to add these four entries (keep existing `dev`/`build`/`start`/`lint`):
```json
    "newsletter:import": "tsx scripts/newsletter/import-audience.ts",
    "newsletter:send": "tsx scripts/newsletter/send-broadcast.ts",
    "newsletter:stats": "tsx scripts/newsletter/stats.ts",
    "test:newsletter": "vitest run tests/newsletter"
```

- [ ] **Step 3: Create vitest config**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/newsletter/**/*.test.ts"],
    environment: "node",
  },
});
```

- [ ] **Step 4: Create env example**

Create `scripts/newsletter/.env.example`:
```bash
# Resend API key (server key, full access). Get it from https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Audience id. Leave blank on first run; import-audience will create one and print the id to paste here.
RESEND_AUDIENCE_ID=

# Verified sender on your Resend domain.
NEWSLETTER_FROM=The Build Log <newsletter@aibuilders.mx>

# Optional reply-to.
NEWSLETTER_REPLY_TO=hola@aibuilders.mx
```

- [ ] **Step 5: Harden gitignore**

Append to `.gitignore`:
```
# Newsletter local secrets
scripts/newsletter/.env
```

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml vitest.config.ts scripts/newsletter/.env.example .gitignore
git commit -m "chore: scaffold newsletter sender (deps, scripts, env example)"
```

---

## Task 1: Issue data types and Issue 002 content

**Files:**
- Create: `scripts/newsletter/issues/types.ts`
- Create: `scripts/newsletter/issues/002-the-build-log.ts`

- [ ] **Step 1: Define the Issue types**

Create `scripts/newsletter/issues/types.ts`:
```ts
export interface Story {
  eyebrow: string; // "01 · Desarrollo"
  title: string;
  href: string;
  body: string; // "Por qué importa: ..."
}

export interface Essay {
  eyebrow: string; // "Ensayo · 3 min de lectura"
  title: string;
  body: string;
  author: string;
  authorRole: string;
  linkText: string;
  linkHref: string;
}

export interface UseCase {
  icon: string; // single glyph, e.g. "⌁"
  title: string;
  body: string;
}

export interface EventItem {
  day: string; // "18"
  month: string; // "Jun"
  label: string; // "AIBM · Online"
  title: string;
  body: string;
  href: string;
}

export interface Community {
  label: string; // "Resumen de la semana"
  title: string; // "Automatización"
  titleSuffix: string; // "· herramientas dev · Claude Code ..."
  body: string;
  stats: string[]; // bullet lines
}

export interface JobItem {
  label: string; // "Contratando"
  title: string;
  meta: string; // "Freelance · remoto LatAm · 4 a 6 meses"
  href: string;
}

export interface Issue {
  slug: string; // "002"
  subject: string; // email subject line
  preview: string; // inbox preview text
  issueLabel: string; // "Issue 002"
  date: string; // "31 May 2026"
  readingTime: string; // "6 min de lectura"
  title: string; // "The Build Log"
  subtitle: string;
  stories: Story[];
  essay: Essay;
  useCases: UseCase[];
  events: EventItem[];
  community: Community;
  jobs: JobItem[];
}
```

- [ ] **Step 2: Port Issue 002 content**

Create `scripts/newsletter/issues/002-the-build-log.ts` (copy text verbatim from `/Users/vellent/Downloads/index.html`):
```ts
import type { Issue } from "./types";

const issue: Issue = {
  slug: "002",
  subject: "The Build Log · Issue 002 — Cada agente cuesta",
  preview: "Lo que importa esta semana para builders de IA en México. Sin paja, sin hype.",
  issueLabel: "Issue 002",
  date: "31 May 2026",
  readingTime: "6 min de lectura",
  title: "The Build Log",
  subtitle:
    "Lo que importa esta semana para builders de IA en México. Sin paja, sin hype. Solo lo que cambia cómo construyes.",
  stories: [
    {
      eyebrow: "01 · Desarrollo",
      title: "Copilot cambió a cobro por tokens: se acabó la barra libre de agentes",
      href: "https://techcrunch.com/2026/05/30/with-microsofts-github-copilot-shifting-to-token-usage-billing-many-developers-bemoan-massive-cost-increases/",
      body: "Por qué importa: para builders principiantes, esta es la lección de la semana: cada agente cuesta. Antes de automatizar todo, mide pasos, contexto y llamadas. El producto no puede depender de una factura sorpresa.",
    },
    {
      eyebrow: "02 · Open source",
      title: "Hermes Agent viene con ruido: la comunidad está mirando agentes open source",
      href: "https://x.com/NousResearch/status/2061097994531869153",
      body: "Por qué importa: AIBY también estuvo hablando de Hermes, Claude Code y flujos con agentes. La oportunidad no es perseguir hype; es entender qué tareas reales conviene delegar y cuáles siguen siendo flujo manual.",
    },
    {
      eyebrow: "03 · Video",
      title: "Grok Video 1.5 entra fuerte en generación de video",
      href: "https://x.com/ai_for_success/status/2061141485865820403",
      body: "Por qué importa: video sigue bajando de dificultad. Si estás validando una idea, ya no necesitas esperar a producción: puedes probar historia, demo, anuncio y tono en horas.",
    },
  ],
  essay: {
    eyebrow: "Ensayo · 3 min de lectura",
    title: "Más agentes no siempre significa más inteligencia.",
    body: "La comunidad lo dijo sin adornos: meter 8 agentes, 156 skills y 72 comandos puede sonar poderoso, pero también puede quemar tokens, contexto y foco. El builder maduro no colecciona agentes. Diseña sistemas que saben cuándo no hacer nada.",
    author: "Javier Rivero",
    authorRole: "Cofundador · AI Builders México",
    linkText: "Leer ensayo",
    linkHref: "https://techcrunch.com/2026/05/30/with-microsofts-github-copilot-shifting-to-token-usage-billing-many-developers-bemoan-massive-cost-increases/",
  },
  useCases: [
    {
      icon: "⌁",
      title: "Menos complejidad en sistemas multi-agente",
      body: "La pregunta incómoda volvió: ¿cuánta arquitectura mejora el resultado y cuánta solo hace más caro pensar?",
    },
    {
      icon: "□",
      title: "Automatización para modernizar legacy",
      body: "Agentes que ayudan a transformar sistemas viejos, no solo a generar demos nuevas. Tema grande para empresas con deuda técnica real.",
    },
    {
      icon: "⌕",
      title: "Productizar trámites aburridos",
      body: "Automatizar registros, documentos y procesos legales puede ser menos sexy que un chatbot, pero resuelve fricción que sí se paga.",
    },
    {
      icon: "✧",
      title: "Interfaces verticales con IA",
      body: "Productos que preguntan poco, interpretan contexto y devuelven una recomendación accionable para una industria concreta.",
    },
  ],
  events: [
    {
      day: "18",
      month: "Jun",
      label: "AIBM · Online",
      title: "How I Use AI #7: WhatsApp Voicebots",
      body: "Demo práctica para builders que quieren entender cómo se diseñan agentes de voz y flujos útiles en WhatsApp.",
      href: "https://www.aibuilders.mx/designwithai",
    },
    {
      day: "24",
      month: "Jun",
      label: "Café Compute · CDMX",
      title: "Meetup para builders de IA",
      body: "Conversaciones chicas, demos reales y gente construyendo sin convertir cada idea en pitch deck.",
      href: "https://luma.com/cafecomputecdmx",
    },
  ],
  community: {
    label: "Resumen de la semana",
    title: "Automatización",
    titleSuffix: "· herramientas dev · Claude Code · Hermes Agent · product management",
    body: "La conversación se movió hacia lo práctico: menos “qué modelo es mejor” y más “cómo diseño un flujo que funcione, cueste poco y pueda repetirse”.",
    stats: [
      "Automatización fue el tema más repetido de la semana.",
      "Claude Code y herramientas de desarrollo siguieron subiendo.",
      "Hermes Agent prendió curiosidad por agentes open source.",
    ],
  },
  jobs: [
    {
      label: "Contratando",
      title: "Desarrollador de automatizaciones con n8n",
      meta: "Freelance · remoto LatAm · 4 a 6 meses",
      href: "https://forms.gle/f37hLgyBo9fyoNU78",
    },
  ],
};

export default issue;
```

- [ ] **Step 3: Typecheck the data file**

Run: `pnpm exec tsc --noEmit scripts/newsletter/issues/002-the-build-log.ts scripts/newsletter/issues/types.ts`
Expected: no output (no type errors). If `tsc` complains about module flags, that's fine to ignore as long as there are no errors in OUR files; the runtime path is `tsx`.

- [ ] **Step 4: Commit**

```bash
git add scripts/newsletter/issues
git commit -m "feat: newsletter issue types and Issue 002 content"
```

---

## Task 2: Subscriber CSV parsing (TDD)

**Files:**
- Test: `tests/newsletter/subscribers.test.ts`
- Create: `scripts/newsletter/lib/subscribers.ts`

The Beehiiv export is a CSV with a header row. We need the `email` column (required) and optional name columns. We skip rows whose status marks them as unsubscribed, lowercase + trim emails, and dedupe.

- [ ] **Step 1: Write the failing test**

Create `tests/newsletter/subscribers.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseSubscribers } from "../../scripts/newsletter/lib/subscribers";

describe("parseSubscribers", () => {
  it("parses valid rows, lowercasing and trimming email", () => {
    const csv = "email,first_name\n  Ada@Example.com ,Ada\n";
    const { valid, errors } = parseSubscribers(csv);
    expect(errors).toEqual([]);
    expect(valid).toEqual([{ email: "ada@example.com", firstName: "Ada" }]);
  });

  it("dedupes by email, keeping the first occurrence", () => {
    const csv = "email\nx@y.com\nX@Y.com\n";
    const { valid } = parseSubscribers(csv);
    expect(valid).toHaveLength(1);
    expect(valid[0].email).toBe("x@y.com");
  });

  it("skips rows marked unsubscribed via a status column", () => {
    const csv = "email,status\na@b.com,active\nc@d.com,unsubscribed\n";
    const { valid } = parseSubscribers(csv);
    expect(valid.map((v) => v.email)).toEqual(["a@b.com"]);
  });

  it("records an error for rows with a missing or invalid email", () => {
    const csv = "email,first_name\n,NoEmail\nnotanemail,Bad\n";
    const { valid, errors } = parseSubscribers(csv);
    expect(valid).toEqual([]);
    expect(errors).toHaveLength(2);
  });

  it("returns an error when there is no email column", () => {
    const csv = "name\nAda\n";
    const { valid, errors } = parseSubscribers(csv);
    expect(valid).toEqual([]);
    expect(errors[0]).toMatch(/email column/i);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:newsletter`
Expected: FAIL — cannot resolve `../../scripts/newsletter/lib/subscribers`.

- [ ] **Step 3: Implement the parser**

Create `scripts/newsletter/lib/subscribers.ts`:
```ts
import { parse } from "csv-parse/sync";

export interface Subscriber {
  email: string;
  firstName?: string;
}

export interface ParseResult {
  valid: Subscriber[];
  errors: string[];
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_KEYS = ["first_name", "firstname", "name", "nombre"];
const STATUS_KEYS = ["status", "state", "subscription_status"];
const UNSUB_VALUES = new Set(["unsubscribed", "unsub", "inactive", "removed", "bounced"]);

export function parseSubscribers(csv: string): ParseResult {
  const errors: string[] = [];
  let rows: Record<string, string>[];
  try {
    rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
  } catch (e) {
    return { valid: [], errors: [`CSV parse error: ${(e as Error).message}`] };
  }

  if (rows.length === 0) return { valid: [], errors: ["CSV has no data rows"] };

  const header = Object.keys(rows[0]).map((k) => k.toLowerCase());
  if (!header.includes("email")) {
    return { valid: [], errors: ["CSV has no email column"] };
  }

  const seen = new Set<string>();
  const valid: Subscriber[] = [];

  rows.forEach((row, i) => {
    const lower: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) lower[k.toLowerCase()] = v;

    const email = (lower.email ?? "").trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      errors.push(`Row ${i + 2}: invalid or missing email ("${lower.email ?? ""}")`);
      return;
    }

    const statusKey = STATUS_KEYS.find((k) => k in lower);
    if (statusKey && UNSUB_VALUES.has((lower[statusKey] ?? "").trim().toLowerCase())) {
      return; // intentionally skipped, not an error
    }

    if (seen.has(email)) return;
    seen.add(email);

    const nameKey = NAME_KEYS.find((k) => k in lower && lower[k]?.trim());
    const firstName = nameKey ? lower[nameKey].trim() : undefined;
    valid.push(firstName ? { email, firstName } : { email });
  });

  return { valid, errors };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:newsletter`
Expected: PASS (5 passing in `subscribers.test.ts`).

- [ ] **Step 5: Commit**

```bash
git add tests/newsletter/subscribers.test.ts scripts/newsletter/lib/subscribers.ts
git commit -m "feat: subscriber CSV parser with validation and dedupe"
```

---

## Task 3: Email-safe Build Log renderer (TDD)

**Files:**
- Test: `tests/newsletter/build-log.test.ts`
- Create: `scripts/newsletter/templates/build-log.ts`

The renderer turns an `Issue` into an email-safe HTML string: inline styles only, fixed px sizes (no `clamp()`), no `<style>` block, no CSS custom properties (`var(--…)`). It must include the Resend unsubscribe token `{{{RESEND_UNSUBSCRIBE_URL}}}`. It keeps the dark Build Log look (`#030303` background, `#e50914` accent).

- [ ] **Step 1: Write the failing test**

Create `tests/newsletter/build-log.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { renderBuildLog } from "../../scripts/newsletter/templates/build-log";
import issue002 from "../../scripts/newsletter/issues/002-the-build-log";

describe("renderBuildLog", () => {
  const html = renderBuildLog(issue002);

  it("includes the issue title and subtitle", () => {
    expect(html).toContain("The Build Log");
    expect(html).toContain(issue002.subtitle);
  });

  it("renders every story title and link", () => {
    for (const s of issue002.stories) {
      expect(html).toContain(s.title);
      expect(html).toContain(s.href);
    }
  });

  it("renders the essay, events, and job", () => {
    expect(html).toContain(issue002.essay.title);
    expect(html).toContain(issue002.events[0].title);
    expect(html).toContain(issue002.jobs[0].title);
  });

  it("includes the Resend unsubscribe token", () => {
    expect(html).toContain("{{{RESEND_UNSUBSCRIBE_URL}}}");
  });

  it("is email-safe: no clamp(), no CSS vars, no <style> block", () => {
    expect(html).not.toContain("clamp(");
    expect(html).not.toContain("var(--");
    expect(html).not.toMatch(/<style[\s>]/);
  });

  it("escapes HTML special characters in content", () => {
    const evil = { ...issue002, title: "A & B <script>" };
    const out = renderBuildLog(evil);
    expect(out).toContain("A &amp; B &lt;script&gt;");
    expect(out).not.toContain("<script>");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:newsletter`
Expected: FAIL — cannot resolve `templates/build-log`.

- [ ] **Step 3: Implement the renderer**

Create `scripts/newsletter/templates/build-log.ts`:
```ts
import type { Issue } from "../issues/types";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Palette (kept from the original Build Log; the email is its own surface).
const BG = "#030303";
const PANEL = "#101010";
const TEXT = "#f4f4f4";
const MUTED = "#999999";
const QUIET = "#5b5b5b";
const LINE = "#252525";
const ACCENT = "#e50914";

const SANS =
  "Helvetica, Arial, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const MONO = "'SF Mono', Menlo, Consolas, monospace";

function hr(): string {
  return `<tr><td style="padding:0;"><div style="height:1px;line-height:1px;font-size:1px;background:${LINE};">&nbsp;</div></td></tr>`;
}

function eyebrow(text: string): string {
  return `<p style="margin:0 0 18px;color:${QUIET};font-family:${MONO};font-size:13px;font-weight:500;letter-spacing:2px;text-transform:uppercase;">${esc(
    text,
  )}</p>`;
}

function sectionHeader(title: string, count: string): string {
  return `<tr><td style="padding:40px 0 28px;">
    <p style="margin:0 0 6px;color:${QUIET};font-family:${MONO};font-size:13px;letter-spacing:2px;text-transform:uppercase;">${esc(
      count,
    )}</p>
    <h2 style="margin:0;color:${TEXT};font-family:${SANS};font-size:34px;font-weight:600;line-height:1.1;">${esc(
      title,
    )}</h2>
  </td></tr>`;
}

export function renderBuildLog(issue: Issue): string {
  const stories = issue.stories
    .map(
      (s) => `
      <div style="padding:0 0 32px;border-bottom:1px solid ${LINE};margin-bottom:32px;">
        ${eyebrow(s.eyebrow)}
        <h3 style="margin:0;font-family:${SANS};font-size:24px;font-weight:600;line-height:1.25;">
          <a href="${esc(s.href)}" style="color:${TEXT};text-decoration:none;">${esc(
        s.title,
      )} ↗</a>
        </h3>
        <p style="margin:16px 0 0;color:${MUTED};font-family:${SANS};font-size:17px;line-height:1.55;">${esc(
          s.body,
        )}</p>
      </div>`,
    )
    .join("");

  const useCases = issue.useCases
    .map(
      (u) => `
      <div style="padding:0 0 28px;">
        <div style="font-size:24px;color:${TEXT};margin-bottom:12px;">${esc(u.icon)}</div>
        <h3 style="margin:0 0 8px;font-family:${SANS};font-size:20px;font-weight:600;color:${TEXT};">${esc(
        u.title,
      )}</h3>
        <p style="margin:0;color:${MUTED};font-family:${SANS};font-size:16px;line-height:1.5;">${esc(
          u.body,
        )}</p>
      </div>`,
    )
    .join("");

  const events = issue.events
    .map(
      (e) => `
      <a href="${esc(e.href)}" style="display:block;text-decoration:none;padding:28px 0;border-bottom:1px solid ${LINE};">
        <p style="margin:0 0 6px;color:${QUIET};font-family:${MONO};font-size:13px;letter-spacing:2px;text-transform:uppercase;">${esc(
        `${e.day} ${e.month} · ${e.label}`,
      )}</p>
        <h3 style="margin:0;font-family:${SANS};font-size:22px;font-weight:600;color:${TEXT};">${esc(
        e.title,
      )} ↗</h3>
        <p style="margin:12px 0 0;color:${MUTED};font-family:${SANS};font-size:16px;line-height:1.5;">${esc(
          e.body,
        )}</p>
      </a>`,
    )
    .join("");

  const jobs = issue.jobs
    .map(
      (j) => `
      <a href="${esc(j.href)}" style="display:block;text-decoration:none;padding:24px 0;border-bottom:1px solid ${LINE};">
        <p style="margin:0 0 6px;color:${QUIET};font-family:${MONO};font-size:13px;letter-spacing:2px;text-transform:uppercase;">${esc(
        j.label,
      )}</p>
        <h3 style="margin:0;font-family:${SANS};font-size:20px;font-weight:600;color:${TEXT};">${esc(
        j.title,
      )} ↗</h3>
        <p style="margin:10px 0 0;color:${MUTED};font-family:${SANS};font-size:15px;">${esc(
          j.meta,
        )}</p>
      </a>`,
    )
    .join("");

  const statsList = issue.community.stats
    .map(
      (line, i) =>
        `<li style="margin:0 0 10px;color:#cfcfcf;font-family:${SANS};font-size:16px;line-height:1.4;"><span style="color:${QUIET};font-family:${MONO};">${String(
          i + 1,
        ).padStart(2, "0")}</span> ${esc(line)}</li>`,
    )
    .join("");

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(issue.title)} · ${esc(issue.issueLabel)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(issue.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
<tr><td align="center" style="padding:32px 16px 64px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:600px;">

  <tr><td style="padding:0 0 24px;">
    <p style="margin:0 0 40px;color:${QUIET};font-family:${MONO};font-size:13px;letter-spacing:2px;text-transform:uppercase;">AI Builders MX</p>
    <h1 style="margin:0;color:${TEXT};font-family:${SANS};font-size:60px;font-weight:400;line-height:0.95;">${esc(
      issue.title,
    )}</h1>
    <p style="margin:24px 0 0;color:#a7a7a7;font-family:${SANS};font-size:22px;line-height:1.4;">${esc(
      issue.subtitle,
    )}</p>
  </td></tr>

  ${hr()}
  <tr><td style="padding:20px 0;">
    <span style="color:${QUIET};font-family:${MONO};font-size:13px;letter-spacing:2px;text-transform:uppercase;">${esc(
      issue.issueLabel,
    )} &nbsp;·&nbsp; ${esc(issue.date)} &nbsp;·&nbsp; ${esc(issue.readingTime)}</span>
  </td></tr>
  ${hr()}

  ${sectionHeader("Esta semana en IA", "01 / 05")}
  <tr><td>${stories}</td></tr>

  ${sectionHeader("Pensamiento de la semana", "02 / 05")}
  <tr><td>
    <div style="padding:32px;border:1px solid ${LINE};border-radius:18px;background:${PANEL};">
      <div style="font-size:36px;color:${TEXT};margin-bottom:20px;">&rdquo;</div>
      ${eyebrow(issue.essay.eyebrow)}
      <h3 style="margin:0 0 16px;font-family:${SANS};font-size:30px;font-weight:400;line-height:1.15;color:${TEXT};">${esc(
        issue.essay.title,
      )}</h3>
      <p style="margin:0;color:${MUTED};font-family:${SANS};font-size:18px;line-height:1.55;">${esc(
        issue.essay.body,
      )}</p>
      <div style="margin-top:28px;padding-top:24px;border-top:1px solid ${LINE};">
        <p style="margin:0;color:#a0a0a0;font-family:${SANS};font-size:16px;">
          <strong style="color:${TEXT};">${esc(issue.essay.author)}</strong><br>${esc(
        issue.essay.authorRole,
      )}
        </p>
        <p style="margin:12px 0 0;"><a href="${esc(
          issue.essay.linkHref,
        )}" style="color:${TEXT};font-family:${SANS};font-size:16px;font-weight:600;text-decoration:underline;">${esc(
    issue.essay.linkText,
  )} ↗</a></p>
      </div>
    </div>
  </td></tr>

  ${sectionHeader("En qué estamos usando IA", "03 / 05")}
  <tr><td style="padding-bottom:20px;">${useCases}</td></tr>

  ${sectionHeader("Próximos eventos", "04 / 05")}
  <tr><td>${events}</td></tr>

  ${sectionHeader("Comunidad", "05 / 05")}
  <tr><td>
    <div style="padding:28px;border:1px solid ${LINE};border-radius:18px;background:${PANEL};">
      ${eyebrow(issue.community.label)}
      <h3 style="margin:0;font-family:${SANS};font-size:24px;font-weight:600;color:${TEXT};">${esc(
        issue.community.title,
      )} <span style="color:${QUIET};font-weight:400;">${esc(
    issue.community.titleSuffix,
  )}</span></h3>
      <p style="margin:16px 0 0;color:${MUTED};font-family:${SANS};font-size:16px;line-height:1.5;">${esc(
        issue.community.body,
      )}</p>
      <ul style="margin:20px 0 0;padding:0 0 0 4px;list-style:none;">${statsList}</ul>
    </div>
    <div style="margin-top:16px;">${jobs}</div>
  </td></tr>

  ${hr()}
  <tr><td style="padding:32px 0 0;">
    <p style="margin:0 0 12px;color:${QUIET};font-family:${SANS};font-size:14px;line-height:1.5;">The Build Log es una curaduría semanal de AI Builders MX para gente que construye con IA en serio.</p>
    <p style="margin:0;color:${QUIET};font-family:${MONO};font-size:12px;letter-spacing:1px;">
      <a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${ACCENT};text-decoration:underline;">Cancelar suscripción</a>
      &nbsp;·&nbsp; AI Builders MX · Ciudad de México
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:newsletter`
Expected: PASS (all `build-log.test.ts` + `subscribers.test.ts` green).

- [ ] **Step 5: Eyeball the output in a browser**

Run: `pnpm exec tsx -e "import i from './scripts/newsletter/issues/002-the-build-log'; import {renderBuildLog} from './scripts/newsletter/templates/build-log'; import {writeFileSync} from 'node:fs'; writeFileSync('/tmp/build-log-002.html', renderBuildLog(i)); console.log('wrote /tmp/build-log-002.html')"`
Then open `/tmp/build-log-002.html` and confirm the dark layout reads well. (This file is temp/throwaway — do not commit it.)

- [ ] **Step 6: Commit**

```bash
git add tests/newsletter/build-log.test.ts scripts/newsletter/templates/build-log.ts
git commit -m "feat: email-safe Build Log HTML renderer"
```

---

## Task 4: Env loader and Resend client

**Files:**
- Create: `scripts/newsletter/lib/env.ts`

This centralizes config loading from `scripts/newsletter/.env` (Node 22 `process.loadEnvFile`) and constructs the Resend client, failing fast with a clear message when a required variable is missing.

- [ ] **Step 1: Implement env + client**

Create `scripts/newsletter/lib/env.ts`:
```ts
import { Resend } from "resend";

function loadDotEnv(): void {
  try {
    // Node 22: loads scripts/newsletter/.env into process.env
    process.loadEnvFile(new URL(".env", import.meta.url));
  } catch {
    // No local .env file — rely on already-exported process.env vars.
  }
}

function required(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    console.error(
      `Missing required env var ${name}. Copy scripts/newsletter/.env.example to scripts/newsletter/.env and fill it in.`,
    );
    process.exit(1);
  }
  return v;
}

export interface NewsletterConfig {
  resend: Resend;
  audienceId: string | undefined;
  from: string;
  replyTo: string | undefined;
}

export function loadConfig(opts: { requireAudience?: boolean } = {}): NewsletterConfig {
  loadDotEnv();
  const apiKey = required("RESEND_API_KEY");
  const from = required("NEWSLETTER_FROM");
  const audienceId = process.env.RESEND_AUDIENCE_ID?.trim() || undefined;
  if (opts.requireAudience && !audienceId) {
    console.error(
      "Missing RESEND_AUDIENCE_ID. Run `pnpm newsletter:import --csv <file>` first; it prints the audience id to paste into .env.",
    );
    process.exit(1);
  }
  return {
    resend: new Resend(apiKey),
    audienceId,
    from,
    replyTo: process.env.NEWSLETTER_REPLY_TO?.trim() || undefined,
  };
}
```

- [ ] **Step 2: Smoke-check it compiles/loads (no key needed for import)**

Run: `pnpm exec tsx -e "import('./scripts/newsletter/lib/env.ts').then(()=>console.log('env module loads ok'))"`
Expected: prints `env module loads ok` (it should NOT exit 1, because we only call `loadConfig()` from the CLIs, not on import).

- [ ] **Step 3: Commit**

```bash
git add scripts/newsletter/lib/env.ts
git commit -m "feat: newsletter env loader and Resend client factory"
```

---

## Task 5: Broadcast payload builder (TDD)

**Files:**
- Test: `tests/newsletter/broadcast.test.ts`
- Create: `scripts/newsletter/lib/broadcast.ts`

Isolate the pure mapping from `(issue, html, opts)` to the Resend broadcast-create payload so it can be unit-tested without hitting the network.

- [ ] **Step 1: Write the failing test**

Create `tests/newsletter/broadcast.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildBroadcastPayload } from "../../scripts/newsletter/lib/broadcast";
import issue002 from "../../scripts/newsletter/issues/002-the-build-log";

describe("buildBroadcastPayload", () => {
  const payload = buildBroadcastPayload(issue002, "<html>hi</html>", {
    audienceId: "aud_123",
    from: "The Build Log <newsletter@aibuilders.mx>",
    replyTo: "hola@aibuilders.mx",
  });

  it("maps issue + opts to Resend fields", () => {
    expect(payload.audienceId).toBe("aud_123");
    expect(payload.from).toBe("The Build Log <newsletter@aibuilders.mx>");
    expect(payload.subject).toBe(issue002.subject);
    expect(payload.html).toBe("<html>hi</html>");
    expect(payload.replyTo).toBe("hola@aibuilders.mx");
  });

  it("names the broadcast with a stable, issue-derived name", () => {
    expect(payload.name).toBe("The Build Log 002");
  });

  it("omits replyTo when not provided", () => {
    const p = buildBroadcastPayload(issue002, "x", {
      audienceId: "a",
      from: "f",
    });
    expect("replyTo" in p).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:newsletter`
Expected: FAIL — cannot resolve `lib/broadcast`.

- [ ] **Step 3: Implement the builder**

Create `scripts/newsletter/lib/broadcast.ts`:
```ts
import type { Issue } from "../issues/types";

export interface BroadcastPayload {
  audienceId: string;
  from: string;
  subject: string;
  html: string;
  name: string;
  replyTo?: string;
}

export function broadcastName(issue: Issue): string {
  return `The Build Log ${issue.slug}`;
}

export function buildBroadcastPayload(
  issue: Issue,
  html: string,
  opts: { audienceId: string; from: string; replyTo?: string },
): BroadcastPayload {
  const payload: BroadcastPayload = {
    audienceId: opts.audienceId,
    from: opts.from,
    subject: issue.subject,
    html,
    name: broadcastName(issue),
  };
  if (opts.replyTo) payload.replyTo = opts.replyTo;
  return payload;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `pnpm test:newsletter`
Expected: PASS (all three suites green).

- [ ] **Step 5: Commit**

```bash
git add tests/newsletter/broadcast.test.ts scripts/newsletter/lib/broadcast.ts
git commit -m "feat: broadcast payload builder"
```

---

## Task 6: `import-audience` CLI

**Files:**
- Create: `scripts/newsletter/import-audience.ts`

Reads a CSV path from `--csv`, parses subscribers, ensures an audience exists (creates one if `RESEND_AUDIENCE_ID` is unset and prints its id), and creates only the contacts not already present (idempotent).

- [ ] **Step 1: Implement the CLI**

Create `scripts/newsletter/import-audience.ts`:
```ts
import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { loadConfig } from "./lib/env";
import { parseSubscribers } from "./lib/subscribers";

async function main() {
  const { values } = parseArgs({
    options: {
      csv: { type: "string" },
      "audience-name": { type: "string" },
    },
  });

  if (!values.csv) {
    console.error("Usage: pnpm newsletter:import --csv <path> [--audience-name <name>]");
    process.exit(1);
  }

  const cfg = loadConfig();
  const csv = readFileSync(values.csv, "utf8");
  const { valid, errors } = parseSubscribers(csv);

  if (errors.length) {
    console.warn(`⚠️  ${errors.length} row(s) skipped:`);
    for (const e of errors.slice(0, 20)) console.warn(`   - ${e}`);
    if (errors.length > 20) console.warn(`   …and ${errors.length - 20} more`);
  }
  if (valid.length === 0) {
    console.error("No valid subscribers found. Aborting.");
    process.exit(1);
  }
  console.log(`Parsed ${valid.length} valid subscriber(s).`);

  // Ensure an audience exists.
  let audienceId = cfg.audienceId;
  if (!audienceId) {
    const name = values["audience-name"] ?? "AI Builders MX — The Build Log";
    const created = await cfg.resend.audiences.create({ name });
    if (created.error || !created.data) {
      console.error(`Failed to create audience: ${created.error?.message}`);
      process.exit(1);
    }
    audienceId = created.data.id;
    console.log(`Created audience "${name}".`);
    console.log(`➡️  Add this to scripts/newsletter/.env:\n    RESEND_AUDIENCE_ID=${audienceId}`);
  }

  // Fetch existing contacts to avoid duplicates.
  const existing = await cfg.resend.contacts.list({ audienceId });
  const known = new Set(
    (existing.data?.data ?? []).map((c) => (c.email ?? "").toLowerCase()),
  );

  let created = 0;
  let skipped = 0;
  let failed = 0;
  for (const sub of valid) {
    if (known.has(sub.email)) {
      skipped++;
      continue;
    }
    const res = await cfg.resend.contacts.create({
      audienceId,
      email: sub.email,
      firstName: sub.firstName,
      unsubscribed: false,
    });
    if (res.error) {
      failed++;
      console.warn(`   ✗ ${sub.email}: ${res.error.message}`);
    } else {
      created++;
    }
  }

  console.log(`\nDone. created=${created} skipped(existing)=${skipped} failed=${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Manual verification — usage guard**

Run: `pnpm newsletter:import`
Expected: prints the `Usage:` line and exits non-zero (no network call, no key needed).

- [ ] **Step 3: Manual verification — real import (operator, with .env filled)**

Pre-req: `scripts/newsletter/.env` exists with `RESEND_API_KEY` + `NEWSLETTER_FROM`; you have the Beehiiv CSV at a known path.
Run: `pnpm newsletter:import --csv ~/Downloads/beehiiv-subscribers.csv`
Expected: prints parsed count; if `RESEND_AUDIENCE_ID` was empty, prints a new audience id to paste into `.env`; then `created=… skipped=… failed=0`. Re-running after pasting the id should show `created=0 skipped=<all>` (idempotent).

- [ ] **Step 4: Commit**

```bash
git add scripts/newsletter/import-audience.ts
git commit -m "feat: import-audience CLI (CSV -> Resend audience, idempotent)"
```

---

## Task 7: `send-broadcast` CLI

**Files:**
- Create: `scripts/newsletter/send-broadcast.ts`

Renders an issue and either: sends a single **test** email to one address (`--test`), validates and counts recipients without sending (`--dry-run`, the default), or creates + sends the real **broadcast** (`--send`).

- [ ] **Step 1: Implement the CLI**

Create `scripts/newsletter/send-broadcast.ts`:
```ts
import { parseArgs } from "node:util";
import { loadConfig } from "./lib/env";
import { renderBuildLog } from "./templates/build-log";
import { buildBroadcastPayload } from "./lib/broadcast";
import type { Issue } from "./issues/types";

async function loadIssue(slug: string): Promise<Issue> {
  try {
    const mod = await import(`./issues/${slug}-the-build-log.ts`);
    return mod.default as Issue;
  } catch {
    console.error(`Could not load issue "${slug}" (expected scripts/newsletter/issues/${slug}-the-build-log.ts).`);
    process.exit(1);
  }
}

function validate(issue: Issue): void {
  const missing: string[] = [];
  if (!issue.subject) missing.push("subject");
  if (!issue.date) missing.push("date");
  if (!issue.stories?.length) missing.push("stories");
  if (missing.length) {
    console.error(`Issue ${issue.slug} is missing required fields: ${missing.join(", ")}`);
    process.exit(1);
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      issue: { type: "string" },
      test: { type: "string" }, // email address
      "dry-run": { type: "boolean", default: false },
      send: { type: "boolean", default: false },
    },
  });

  if (!values.issue) {
    console.error("Usage: pnpm newsletter:send --issue <slug> [--test you@email.com | --dry-run | --send]");
    process.exit(1);
  }

  const issue = await loadIssue(values.issue);
  validate(issue);
  const html = renderBuildLog(issue);

  // --test: send a single transactional preview (unsubscribe token replaced with #).
  if (values.test) {
    const cfg = loadConfig();
    const previewHtml = html.replace(/\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/g, "#");
    const res = await cfg.resend.emails.send({
      from: cfg.from,
      to: [values.test],
      subject: `[TEST] ${issue.subject}`,
      html: previewHtml,
      replyTo: cfg.replyTo,
    });
    if (res.error) {
      console.error(`Test send failed: ${res.error.message}`);
      process.exit(1);
    }
    console.log(`✓ Test email sent to ${values.test} (id=${res.data?.id}).`);
    return;
  }

  // --send: create + send the real broadcast.
  if (values.send) {
    const cfg = loadConfig({ requireAudience: true });
    const payload = buildBroadcastPayload(issue, html, {
      audienceId: cfg.audienceId!,
      from: cfg.from,
      replyTo: cfg.replyTo,
    });
    const created = await cfg.resend.broadcasts.create(payload);
    if (created.error || !created.data) {
      console.error(`Broadcast create failed: ${created.error?.message}`);
      process.exit(1);
    }
    const sent = await cfg.resend.broadcasts.send(created.data.id);
    if (sent.error) {
      console.error(`Broadcast send failed: ${sent.error.message}`);
      process.exit(1);
    }
    console.log(`✓ Broadcast "${payload.name}" sent (id=${created.data.id}).`);
    console.log(`  Track results: pnpm newsletter:stats --issue ${issue.slug}`);
    return;
  }

  // default: --dry-run
  const cfg = loadConfig({ requireAudience: true });
  const contacts = await cfg.resend.contacts.list({ audienceId: cfg.audienceId! });
  const total = contacts.data?.data?.length ?? 0;
  const subscribed = (contacts.data?.data ?? []).filter((c) => !c.unsubscribed).length;
  console.log(`DRY RUN — issue ${issue.slug} "${issue.subject}"`);
  console.log(`  HTML rendered: ${html.length} bytes`);
  console.log(`  Audience contacts: ${total} (subscribed: ${subscribed})`);
  console.log(`  Nothing was sent. Use --test <email> to preview, or --send to broadcast.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Manual verification — usage guard**

Run: `pnpm newsletter:send`
Expected: prints `Usage:` and exits non-zero.

- [ ] **Step 3: Manual verification — dry run (operator, .env + audience filled)**

Run: `pnpm newsletter:send --issue 002 --dry-run`
Expected: prints rendered byte size and the audience contact count; sends nothing.

- [ ] **Step 4: Manual verification — test email (operator)**

Run: `pnpm newsletter:send --issue 002 --test you@your-email.com`
Expected: `✓ Test email sent`. Open it in Gmail and one of Outlook/Apple Mail; confirm the dark layout, links, and footer render. The "Cancelar suscripción" link points to `#` in test mode (expected).

- [ ] **Step 5: Commit**

```bash
git add scripts/newsletter/send-broadcast.ts
git commit -m "feat: send-broadcast CLI (test, dry-run, send)"
```

---

## Task 8: `stats` CLI

**Files:**
- Create: `scripts/newsletter/stats.ts`

Finds the broadcast for an issue by its stable name, fetches it, and prints whatever delivery/engagement fields Resend returns (the Resend dashboard remains the rich view).

- [ ] **Step 1: Implement the CLI**

Create `scripts/newsletter/stats.ts`:
```ts
import { parseArgs } from "node:util";
import { loadConfig } from "./lib/env";

async function main() {
  const { values } = parseArgs({
    options: { issue: { type: "string" } },
  });

  if (!values.issue) {
    console.error("Usage: pnpm newsletter:stats --issue <slug>");
    process.exit(1);
  }

  const cfg = loadConfig();
  const name = `The Build Log ${values.issue}`;

  const list = await cfg.resend.broadcasts.list();
  const match = (list.data?.data ?? []).find((b) => b.name === name);
  if (!match) {
    console.error(`No broadcast named "${name}" found. Has it been sent?`);
    process.exit(1);
  }

  const detail = await cfg.resend.broadcasts.get(match.id);
  if (detail.error || !detail.data) {
    console.error(`Failed to fetch broadcast: ${detail.error?.message}`);
    process.exit(1);
  }

  const d = detail.data as Record<string, unknown>;
  console.log(`Broadcast "${name}" (id=${match.id})`);
  console.log(`  status:      ${d.status ?? "—"}`);
  console.log(`  sent_at:     ${d.sent_at ?? "—"}`);
  // Resend exposes engagement counts on the broadcast object when available;
  // print any present, and always point to the dashboard for the live view.
  for (const k of ["delivered", "opened", "clicked", "bounced", "complained", "unsubscribed"]) {
    if (k in d) console.log(`  ${k.padEnd(12)} ${String(d[k])}`);
  }
  console.log(`\n  Full analytics: https://resend.com/broadcasts/${match.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

- [ ] **Step 2: Manual verification — usage guard**

Run: `pnpm newsletter:stats`
Expected: prints `Usage:` and exits non-zero.

- [ ] **Step 3: Manual verification — after a real send (operator)**

Run: `pnpm newsletter:stats --issue 002`
Expected: prints the broadcast status, sent time, any engagement counts Resend returns, and a dashboard link.

- [ ] **Step 4: Commit**

```bash
git add scripts/newsletter/stats.ts
git commit -m "feat: stats CLI for broadcast metrics"
```

---

## Task 9: Operator runbook

**Files:**
- Create: `scripts/newsletter/README.md`

- [ ] **Step 1: Write the runbook**

Create `scripts/newsletter/README.md`:
```markdown
# Newsletter sender (The Build Log)

Standalone CLI to send AI Builders MX newsletter issues via Resend Broadcasts.
Runs locally (later: Railway). It does **not** deploy to Vercel and uses no secret
that lives on Vercel.

## One-time setup

1. `cp scripts/newsletter/.env.example scripts/newsletter/.env`
2. Fill `RESEND_API_KEY` and `NEWSLETTER_FROM` (a verified sender on your Resend domain).
3. Import your list (also creates the audience the first time):
   `pnpm newsletter:import --csv ~/Downloads/beehiiv-subscribers.csv`
4. Paste the printed `RESEND_AUDIENCE_ID=…` into `scripts/newsletter/.env`.

## Sending an issue

1. Preview: `pnpm newsletter:send --issue 002 --dry-run`
2. Test to yourself: `pnpm newsletter:send --issue 002 --test you@email.com`
   (check Gmail + Outlook/Apple Mail rendering)
3. Send for real: `pnpm newsletter:send --issue 002 --send`
4. Check results: `pnpm newsletter:stats --issue 002`

## Adding a new issue

Copy `issues/002-the-build-log.ts` to `issues/<NNN>-the-build-log.ts`, edit the
content, then run the send commands with `--issue <NNN>`.

## Tests

`pnpm test:newsletter` (CSV parsing, HTML rendering, payload building).

## Notes

- The subscriber list lives in the Resend Audience for now (Phase 1). It is
  exportable; a future phase moves it to our own DB + on-site signup.
- The email intentionally keeps the dark Build Log look and is exempt from the
  site's black/white design system. Web surfaces (future archive) follow the system.
```

- [ ] **Step 2: Commit**

```bash
git add scripts/newsletter/README.md
git commit -m "docs: newsletter sender operator runbook"
```

---

## Final verification

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test:newsletter`
Expected: all suites pass (subscribers, build-log, broadcast).

- [ ] **Step 2: Lint**

Run: `pnpm lint`
Expected: no new errors in `scripts/newsletter/**`.

- [ ] **Step 3: Confirm no secret is committed**

Run: `git status --porcelain scripts/newsletter/.env`
Expected: empty output (the file is git-ignored / absent).

- [ ] **Step 4: Operator end-to-end (manual, requires real CSV + key)**

Import → dry-run → test → send → stats, per the runbook. Verify a real inbox receives a correctly-rendered Build Log with a working unsubscribe link.

---

## Self-review notes (coverage vs spec)

- **Send via Resend Broadcasts** → Tasks 6 (import), 7 (send). ✓
- **Email-safe Build Log, dark/red aesthetic, unsubscribe** → Task 3 (renderer + token + escaping). ✓
- **Issue as versioned data (reusable for web archive)** → Task 1 (types + 002). ✓
- **CSV import to audience, idempotent** → Tasks 2 (parse) + 6 (import). ✓
- **Open/click analytics** → native via Broadcasts (Task 7) + Task 8 (stats summary). ✓
- **Secrets only local, never Vercel** → Task 0 (.env.example + gitignore) + Task 4 (env loader) + final check. ✓
- **No Supabase / no Vercel dependency** → entire CLI is standalone; verified in Final verification. ✓
- **Test coverage where pure** → Tasks 2, 3, 5 are TDD; network commands verified manually via guards + dry-run/test. ✓
