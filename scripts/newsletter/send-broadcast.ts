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
