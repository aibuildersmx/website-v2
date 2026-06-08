import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { parseBeehiiv, parseEventCsv, parseCursorAttendees } from "../../lib/community/parse";
import { mergeContacts, sourceCounts } from "../../lib/community/merge";
import type { ContactInput } from "../../lib/community/types";

async function main() {
  const { values } = parseArgs({
    options: {
      beehiiv: { type: "string" },
      attendees: { type: "string" },
      leads: { type: "string" },
      "cursor-attendees": { type: "string" },
      "dry-run": { type: "boolean", default: false },
    },
  });

  const inputs: ContactInput[] = [];
  if (values.beehiiv) inputs.push(...parseBeehiiv(readFileSync(values.beehiiv, "utf8")));
  if (values.attendees) inputs.push(...parseEventCsv(readFileSync(values.attendees, "utf8"), "cursor-event"));
  if (values.leads) inputs.push(...parseEventCsv(readFileSync(values.leads, "utf8"), "lead"));
  if (values["cursor-attendees"])
    inputs.push(...parseCursorAttendees(readFileSync(values["cursor-attendees"], "utf8")));

  if (inputs.length === 0) {
    console.error(
      "Usage: pnpm community:import --beehiiv <csv> --attendees <csv> --leads <csv> --cursor-attendees <csv> [--dry-run]",
    );
    process.exit(1);
  }

  const merged = mergeContacts(inputs);
  const subscribed = merged.filter((c) => c.newsletterSubscribed).length;
  console.log(`Parsed ${inputs.length} rows → ${merged.length} unique contacts.`);
  console.log(`  source coverage:`, sourceCounts(merged));
  console.log(`  newsletter_subscribed: ${subscribed} / ${merged.length}`);

  if (values["dry-run"]) {
    console.log("DRY RUN — nothing written.");
    process.exit(0);
  }

  // Friendly preflight: lib/db/client throws a bare "DATABASE_URL is not set"
  // at module load, so check here and give the operator a clear remedy instead.
  if (!process.env.DATABASE_URL?.trim()) {
    console.error(
      "DATABASE_URL is not set. For a local run, use Railway's public proxy:\n" +
        '  export DATABASE_URL="$(railway variables --service Postgres --kv | grep \'^DATABASE_PUBLIC_URL=\' | cut -d= -f2-)"\n' +
        "then re-run, or pass --dry-run to parse/merge without writing.",
    );
    process.exit(1);
  }

  // Lazy-load the DB layer so the dry-run path never imports lib/db/client,
  // which throws at module load when DATABASE_URL is unset.
  const { importContacts } = await import("../../lib/community/import");
  const { db } = await import("../../lib/db/client");
  const res = await importContacts(db, merged);
  console.log(`Done. inserted=${res.inserted} updated=${res.updated}`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
