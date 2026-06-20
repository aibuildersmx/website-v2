---
name: newsletter-from-html
description: Use when handed an HTML newsletter / issue for "The Build Log" (aibuilders.mx) and asked to convert it, import it, turn it into the right format, or create a draft. Triggers on a pasted/attached newsletter HTML file plus a request to process, format, load, or upload it.
---

# Newsletter from HTML → Issue draft

## Overview
Someone hands us a designed HTML newsletter ("The Build Log"). The app does NOT store raw HTML — it stores a structured `Issue` JSON (`lib/newsletter/types.ts`) that the app renders into an email. Your job: map the HTML into that `Issue` JSON, then run the import script, which wraps links and creates the draft in Railway. **Stop at the draft** — sending is a separate, deliberate step.

## Workflow
1. Read the HTML file.
2. Map its content to an `Issue` object (see mapping + rules below).
3. Write the JSON to a temp file, e.g. `/tmp/issue-<slug>.json`.
4. Run the import (wraps links through `/r`, validates, upserts the draft):
   ```bash
   set -a && source .env.local && set +a
   pnpm tsx scripts/newsletter/import-issue.ts /tmp/issue-<slug>.json
   ```
5. Report the draft URL. Offer the canary + warmup next steps (don't run them unprompted).

## HTML → Issue field map
| HTML | Issue field |
|---|---|
| `.meta` "Issue 003" | `slug` = "003", `issueLabel` = "Issue 003" |
| `.meta` date / reading time | `date` ("14 Jun 2026"), `readingTime` ("6 min de lectura") |
| `h1` / `.subtitle` | `title` ("The Build Log"), `subtitle` |
| `.story` (eyebrow/h3 link/p) | `stories[]` = {eyebrow, title, href, body} |
| `.use-case` (icon/h3/p) | `useCases[]` = {icon, title, body} — **icon = Phosphor name, see below** |
| `.event` (date-box/label/h3/p, href) | `events[]` = {day, month, label, title, body, href} |
| `.community-card` | `community` = {label, title, titleSuffix, body, stats[]} |
| `.job` | `jobs[]` = {label, title, meta, href} |
| (essay section, if present) | `essay` = {eyebrow, title, body, author, authorRole, linkText, linkHref} |

Copy `lib/newsletter/issue.ts` (`emptyIssue`) for the exact default shape; an absent section stays empty (the renderer omits empty sections). Most issues have no essay → leave `essay` fields `""`.

## Non-obvious rules (these are where conversions go wrong)
- **Icons are Phosphor NAMES, never glyphs/emoji.** The HTML shows a glyph (`⌁`, `□`, `⌕`, `✧`); the email renders a PNG by Phosphor name (`lib/newsletter/icons.ts`). Pick a kebab-case name by meaning. Common map: `⌁`→`git-fork` (routing/fallback), `□`/`↻`→`repeat` (loops/automation), `⌕`→`magnifying-glass` or `cpu` (search/local), `✧`→`sparkle` or `rocket-launch` (new/startup), inbox→`envelope`, money→`coins`, desktop→`desktop`, package→`package`. Browse names at https://phosphoricons.com. The import script REJECTS non-kebab icons, so glyphs fail fast.
- **`subject`** is a short descriptive sentence (e.g. "Anthropic apaga Fable 5, open source al alza y subagentes en Claude Code") — NOT "Issue 003" or "The Build Log · Issue 003". The HTML usually lacks it; write one from the stories. Ask the user if unsure.
- **`preview`** is the inbox preview line (one sentence hook). Write one if the HTML has none.
- **`community.stats`** holds only the text; strip the leading "01"/"02" `<span>` numbers (the renderer numbers them).
- **Links**: do NOT pre-wrap them — leave the real destination URLs in the JSON; the import script wraps every external link through `/r`. `mailto:` is left as-is automatically.
- **Don't blast.** The script only creates a draft. To send, hand off to: canary `scripts/newsletter/test-send.ts --from <slug> --emails ...`, then `scripts/newsletter/start-warmup.ts <issueId>` (see [[newsletter-deliverability]]).

## Conventions
- Months in `date`/events use Spanish 3-letter caps relative to the design (e.g. "Jun"). Match the existing issues (slug 001/002) for tone.
- Match an existing sent issue for exact field style if in doubt: `psql "$DATABASE_URL" -c "select jsonb_pretty(data) from newsletter_issues where slug='002';"`.

## Common mistakes
| Mistake | Fix |
|---|---|
| Glyph/emoji as `useCases[].icon` | Use a Phosphor kebab-case name; script rejects glyphs |
| Raw `x.com`/`luma` links left in body | Leave real URLs; the script wraps them through `/r` |
| `subject` = "Issue 003" or the `<title>` | Write a descriptive sentence from the stories |
| Keeping "01"/"02" inside `community.stats` text | Strip them; renderer numbers stats |
| Auto-sending / running warmup | Stop at draft; sending is a separate, confirmed step |
