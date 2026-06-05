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
