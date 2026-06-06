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
