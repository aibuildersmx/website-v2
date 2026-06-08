# Community contacts import

Imports the community CSV sources into the Railway Postgres `contacts` table — the
unified single source of truth (Beehiiv subscribers + Cursor event attendees + leads).
Part of Phase 1 of the community-DB migration (spec/plan in `docs/superpowers/`).

## Usage

```bash
pnpm community:import \
  --beehiiv ~/ai-builders-mx-basic_subscriber-YYYY-MM-DD.csv \
  --attendees ~/attendees.csv \
  --leads ~/leads.csv \
  --cursor-attendees ~/cursor-attendees.csv \
  [--dry-run]
```

- `--dry-run` parses + merges + reports counts, writes nothing (no DB connection needed).
- Without `--dry-run` it upserts into `contacts` and prints `inserted=… updated=…`.
- Each `--flag` is optional; pass whichever sources you have.

## ⚠️ Run with the FULL set of sources

The upsert overwrites each contact's mutable columns with the **merged** value, so a
contact's `sources`, `tags`, and `firstSeenAt` reflect *only the CSVs present in the run*.
Running with a partial set (e.g. just `--beehiiv`) will drop the source tags / earliest
`first_seen_at` contributed by the omitted CSVs. **Always re-import with every source CSV.**
The import is idempotent: re-running the full set updates rows in place (no duplicates).

## DATABASE_URL (local runs)

The deployed app gets `DATABASE_URL` from Railway automatically (internal
`postgres.railway.internal`, which does **not** resolve from a laptop). For a local
run, use the public proxy:

```bash
export DATABASE_URL="$(railway variables --service Postgres --kv | grep '^DATABASE_PUBLIC_URL=' | cut -d= -f2-)"
```

(The `railway` CLI is occasionally flaky and returns empty — re-run the export if
`echo ${#DATABASE_URL}` is 0.) Do not commit the public URL.

## Consent

All contacts are imported with `newsletter_subscribed = true` **except** Beehiiv rows
whose status is an explicit opt-out (`unsubscribed`/`bounced`/…), which are imported
with `false` and never mailed (CAN-SPAM). To narrow a send later, segment by `sources[]`.
