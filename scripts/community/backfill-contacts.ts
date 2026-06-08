import { parseArgs } from "node:util";

// One-off data backfill over the `contacts` table:
//   1. newsletter_subscribed = true  (everyone is subscribed)
//   2. sources = ['community']       (overwrite — one default source for all)
//
// Run:  pnpm community:backfill            (writes)
//       pnpm community:backfill --dry-run  (counts only, no writes)
async function main() {
  const { values } = parseArgs({
    options: { "dry-run": { type: "boolean", default: false } },
  });

  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is not set. For a local run, use Railway's public proxy:\n" +
        '  export DATABASE_URL="$(railway variables --service Postgres --kv | grep \'^DATABASE_PUBLIC_URL=\' | cut -d= -f2-)"\n' +
        "then re-run.",
    );
    process.exit(1);
  }

  const { sql } = await import("drizzle-orm");
  const { db } = await import("../../lib/db/client");
  const { contacts } = await import("../../lib/db/schema");

  const [{ total }] = await db.select({ total: sql<number>`count(*)` }).from(contacts);
  console.log(`contacts in table: ${Number(total)}`);

  if (values["dry-run"]) {
    console.log("DRY RUN — would set newsletter_subscribed=true and sources=['community'] on all rows.");
    process.exit(0);
  }

  const res = await db
    .update(contacts)
    .set({ newsletterSubscribed: true, sources: ["community"], updatedAt: new Date() });

  console.log(`Done. Updated ${res.count ?? Number(total)} rows.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
