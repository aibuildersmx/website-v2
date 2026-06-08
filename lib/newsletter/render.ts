import type { Issue } from "./types";
import { siteUrl } from "./unsubscribe";

// Use-case icons are Phosphor glyphs served as PNGs (Gmail/Outlook strip inline
// SVG, so an <img> with an absolute URL is the only email-safe option). The route
// rasterizes any Phosphor name on demand, so new icons need no pre-generation.
// `UseCase.icon` holds the Phosphor icon name, e.g. "repeat".
function iconUrl(name: string): string {
  return `${siteUrl()}/api/newsletter/icons/${name}.png`;
}

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
        <div style="width:44px;height:44px;border:1px solid ${LINE};border-radius:12px;text-align:center;line-height:44px;margin-bottom:16px;">
          <img src="${esc(iconUrl(u.icon))}" width="24" height="24" alt="" style="display:inline-block;vertical-align:middle;">
        </div>
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

  const essayBlock = `<tr><td>
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
  </td></tr>`;

  const communityBlock = `<tr><td>
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
  </td></tr>`;

  // Sections render only when they carry content, and the "NN / TOTAL" counter
  // is computed from how many actually render — so an issue without an essay
  // shows "01 / 04" instead of a hardcoded "/ 05" with an empty card.
  const sections: Array<[string, string]> = [];
  if (issue.stories.length)
    sections.push(["Esta semana en IA", `<tr><td>${stories}</td></tr>`]);
  if (issue.essay.title.trim()) sections.push(["Pensamiento de la semana", essayBlock]);
  if (issue.useCases.length)
    sections.push([
      "En qué estamos usando IA",
      `<tr><td style="padding-bottom:20px;">${useCases}</td></tr>`,
    ]);
  if (issue.events.length)
    sections.push([
      issue.eventsLabel?.trim() || "Próximos eventos",
      `<tr><td>${events}</td></tr>`,
    ]);
  if (issue.community.title.trim() || issue.jobs.length)
    sections.push(["Comunidad", communityBlock]);

  const total = String(sections.length).padStart(2, "0");
  const sectionsHtml = sections
    .map(
      ([title, body], i) =>
        sectionHeader(title, `${String(i + 1).padStart(2, "0")} / ${total}`) + body,
    )
    .join("\n");

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

  ${sectionsHtml}

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
