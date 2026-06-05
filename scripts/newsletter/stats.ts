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
