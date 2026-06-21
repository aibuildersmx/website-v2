# Comunidad Dashboard — Fase 4 (Cleanup del bot) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the now-migrated Vite SPA dashboard from the `aibuilders-bot` repo while keeping the `/dashboard/api/*` HTTP API intact, and harden the API auth to accept the key only via the `x-api-key` header (drop the `?key=` query-param path).

**Architecture:** Pure subtraction in a **separate repo** (`/Users/vellent/sites/aibuilders-bot`, not the website repo). Delete the `dashboard/` Vite app, the Express static-serving block that served its build, and the build hooks in `package.json` + `Dockerfile`. Keep `createDashboardRouter()` (the API) and its mount untouched. Harden `authMiddleware` + `authKeyMiddleware` by removing the `?? req.query.key` fallback.

**Tech Stack:** Node 22 + TypeScript (tsc build, no unit-test runner), Express 5, Docker (Railway). Verification is `npm run build` (tsc) + curl smoke against the live API.

## Global Constraints

- **Repo:** all changes + commits happen in `/Users/vellent/sites/aibuilders-bot` (the bot), NOT the website repo. The website's `lib/aiby/client.ts` already uses the `x-api-key` header, so hardening is safe.
- **The `/dashboard/api/*` routes and `createDashboardRouter()` MUST keep working** — they are the website admin's only data source.
- No package manager lockfile churn beyond removing the deleted `dashboard/` and its scripts. The bot uses `npm`.
- Scope (confirmed): delete **only** the SPA + harden auth. Keep every other HTTP endpoint (`/auth/*`, `/messages/*`, memory admin, WhatsApp send) and the Baileys ingestion.
- Verification per task: `npm run build` must pass (tsc); behavioral checks via `curl` against the deployed bot.

---

### Task 1: Harden auth — header-only key

**Files:**
- Modify: `src/api.ts:28` and `src/api.ts:35`

**Interfaces:**
- Consumes: nothing new.
- Produces: `authMiddleware` and `authKeyMiddleware` that read the key only from `req.headers["x-api-key"]`.

- [ ] **Step 1: Drop the query-param fallback in `authMiddleware`**

In `src/api.ts`, change line 28 from:

```typescript
  const key = req.headers["x-api-key"] ?? req.query.key;
```

to:

```typescript
  const key = req.headers["x-api-key"];
```

- [ ] **Step 2: Drop the query-param fallback in `authKeyMiddleware`**

In `src/api.ts`, change line 35 (the identical line inside `authKeyMiddleware`) from:

```typescript
  const key = req.headers["x-api-key"] ?? req.query.key;
```

to:

```typescript
  const key = req.headers["x-api-key"];
```

Both edits are the same string; apply to both occurrences. After this, `req.query.key` no longer appears in the file.

- [ ] **Step 3: Build to verify it compiles**

Run: `cd /Users/vellent/sites/aibuilders-bot && npm run build`
Expected: tsc succeeds, no errors. (`req.query` is still valid Express typing; we just stopped reading `.key`.)

- [ ] **Step 4: Commit**

```bash
cd /Users/vellent/sites/aibuilders-bot
git add src/api.ts
git commit -m "harden(api): accept dashboard/auth key only via x-api-key header"
```

---

### Task 2: Remove the SPA static-serving block

**Files:**
- Modify: `src/api.ts` (delete the `dashboard/dist` serving block; remove the now-unused `resolve` import)

**Interfaces:**
- Consumes: nothing.
- Produces: an `api.ts` that no longer serves the SPA but still mounts `/dashboard/api` via `createDashboardRouter()`.

- [ ] **Step 1: Delete the SPA serving block**

In `src/api.ts`, delete this entire block (currently lines 232–243):

```typescript
  // Dashboard SPA — built artifacts under dashboard/dist (Vite)
  const DASHBOARD_DIST = resolve(process.cwd(), "dashboard/dist");
  if (existsSync(DASHBOARD_DIST)) {
    app.use("/dashboard", express.static(DASHBOARD_DIST));
    app.get(/^\/dashboard\/(?!api).*/, (_req, res) => {
      res.sendFile(join(DASHBOARD_DIST, "index.html"));
    });
  } else {
    app.get("/dashboard", (_req, res) => {
      res.status(503).type("text/plain").send("Dashboard build not found. Run `npm run dashboard:build`.");
    });
  }
```

Leave the line above it — `app.use("/dashboard/api", authMiddleware, createDashboardRouter());` — untouched.

- [ ] **Step 2: Remove the now-unused `resolve` import**

After deleting the block, `resolve` is no longer used (it only appeared at the deleted `DASHBOARD_DIST` line; `join` is still used at the `/messages` handler, and `existsSync` is still used by the `/messages` handlers). Change line 7 from:

```typescript
import { join, resolve } from "path";
```

to:

```typescript
import { join } from "path";
```

- [ ] **Step 3: Build to verify no unused-symbol / type errors**

Run: `cd /Users/vellent/sites/aibuilders-bot && npm run build`
Expected: tsc succeeds. If tsc reports any other now-unused import (it should not — `existsSync`/`join` remain used), remove exactly that symbol and rebuild.

- [ ] **Step 4: Confirm the API mount is still present**

Run: `cd /Users/vellent/sites/aibuilders-bot && grep -n "dashboard/api" src/api.ts`
Expected: the `app.use("/dashboard/api", authMiddleware, createDashboardRouter());` line still appears.

- [ ] **Step 5: Commit**

```bash
cd /Users/vellent/sites/aibuilders-bot
git add src/api.ts
git commit -m "chore(api): stop serving the Vite dashboard SPA (API stays)"
```

---

### Task 3: Delete the SPA directory + build hooks

**Files:**
- Delete: `dashboard/` (whole directory)
- Modify: `package.json` (remove dashboard scripts; fix `start`)
- Modify: `Dockerfile` (remove the dashboard build step)

**Interfaces:**
- Consumes: nothing.
- Produces: a repo with no `dashboard/` and a `start` script that no longer builds it.

- [ ] **Step 1: Delete the dashboard directory**

Run:
```bash
cd /Users/vellent/sites/aibuilders-bot && git rm -r dashboard
```
Expected: git stages the deletion of `dashboard/` (src, dist, package.json, configs, etc.).

- [ ] **Step 2: Fix the `start` script and remove dashboard scripts in `package.json`**

In `package.json`, change the `start` script from:

```json
    "start": "bash init-volume.sh && npm run dashboard:build && tsx src/index.ts",
```

to:

```json
    "start": "bash init-volume.sh && tsx src/index.ts",
```

Then delete these three script lines entirely:

```json
    "dashboard:install": "cd dashboard && npm install --no-audit --no-fund",
    "dashboard:build": "cd dashboard && (test -d node_modules || npm install --no-audit --no-fund) && npm run build",
    "dashboard:dev": "cd dashboard && npm run dev"
```

(Mind trailing commas: ensure the script object stays valid JSON after removal.)

- [ ] **Step 3: Remove the dashboard build step from the Dockerfile**

In `Dockerfile`, delete this line (currently line 18):

```dockerfile
RUN cd dashboard && npm ci --no-audit --no-fund && npm run build && rm -rf node_modules
```

- [ ] **Step 4: Verify no lingering references to the SPA build**

Run:
```bash
cd /Users/vellent/sites/aibuilders-bot && grep -rn "dashboard:build\|dashboard/dist\|dashboard:dev\|dashboard:install" --include="*.json" --include="*.ts" --include="Dockerfile" .
```
Expected: no output (all references gone). The string `dashboard/api` in `src/api.ts` is fine and unrelated.

- [ ] **Step 5: Build to verify the package still compiles**

Run: `cd /Users/vellent/sites/aibuilders-bot && npm run build`
Expected: tsc succeeds.

- [ ] **Step 6: Commit**

```bash
cd /Users/vellent/sites/aibuilders-bot
git add package.json Dockerfile
git commit -m "chore: remove Vite dashboard app + its build hooks"
```

---

### Task 4: Trim README + final verification

**Files:**
- Modify: `README.md` (remove SPA-frontend references; keep the API documented)

**Interfaces:**
- Consumes: nothing.
- Produces: docs that no longer point at a deleted SPA.

- [ ] **Step 1: Find the dashboard SPA references in the README**

Run:
```bash
cd /Users/vellent/sites/aibuilders-bot && grep -ni "dashboard" README.md
```
Note the line numbers mentioning the SPA / "Live Dashboard" / `dashboard:dev` / `dashboard:build` / `?key=`.

- [ ] **Step 2: Edit the README**

Remove the SPA-specific content (the "Live Dashboard" section, the `dashboard:dev`/`dashboard:build` instructions, and any `?key=` query-param auth note). Where the README lists served endpoints, keep a single line documenting the API instead, e.g.:

```markdown
- `/dashboard/api/*` — read-only metrics API (auth: `x-api-key` header). Consumed by the aibuilders admin (`/admin/comunidad`).
```

Leave all non-dashboard README content untouched.

- [ ] **Step 3: Final build**

Run: `cd /Users/vellent/sites/aibuilders-bot && npm run build`
Expected: tsc succeeds.

- [ ] **Step 4: Commit**

```bash
cd /Users/vellent/sites/aibuilders-bot
git add README.md
git commit -m "docs: drop dashboard SPA references, document the API"
```

- [ ] **Step 5: Post-deploy smoke (run AFTER the bot redeploys on Railway)**

These verify the live behavior change. Run once Railway has deployed the new bot:

```bash
BASE="https://aiby-bridge-production-0c9f.up.railway.app"; KEY="<API_KEY>"
# API still works with the header:
curl -s -o /dev/null -w "header overview: %{http_code}\n" -H "x-api-key: $KEY" "$BASE/dashboard/api/overview?preset=week"   # expect 200
# Query-param key is now rejected:
curl -s -o /dev/null -w "?key= overview: %{http_code}\n" "$BASE/dashboard/api/overview?preset=week&key=$KEY"                 # expect 401
# The SPA is gone (no HTML served at /dashboard):
curl -s -o /dev/null -w "spa root: %{http_code}\n" "$BASE/dashboard"                                                          # expect 404
```
Expected: `200`, `401`, `404`. If `/dashboard/api/overview` with the header returns anything other than 200, STOP — the API mount regressed.

---

## Self-Review Notes

- **Spec coverage (Fase 4):** delete SPA frontend ✓ (Tasks 2–3), keep `/dashboard/api/*` ✓ (Task 2 step 4 + Task 4 smoke), harden API_KEY (drop `?key=`) ✓ (Task 1). README ✓ (Task 4).
- **Scope guard:** only the SPA + auth hardening change. All other HTTP endpoints, the MCP mount, and Baileys ingestion are untouched (confirmed scope decision).
- **Import safety:** only `resolve` becomes unused after the block deletion; `existsSync` (`/messages` handlers, lines 63/73) and `join` (line 72) stay. Task 2 step 3 rebuild catches anything missed.
- **Deploy ordering:** auth hardening + SPA removal take effect only after Railway redeploys the bot. The website admin already authenticates via header, so no coordinated change is needed — but the live smoke (Task 4 step 5) must run post-deploy, not locally.
- **No placeholders:** every code/edit/command step shows exact content; README trim is grep-guided because its line numbers aren't pinned, but the target strings are explicit.
