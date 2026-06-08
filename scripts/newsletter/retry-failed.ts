// Re-enqueue the failed sends of an issue through the real queue. Mirrors the
// admin "Reintentar fallidos" action (lib/actions/newsletter.ts → retryFailed)
// as a CLI for ops. Idempotent: only `failed` rows are reset to `pending` and
// re-enqueued; already-`sent` recipients are never touched (no duplicates).
//
//   set -a && . ./.env.local && set +a && pnpm tsx scripts/newsletter/retry-failed.ts <issueId>

import { parseArgs } from "node:util";

async function main() {
  const { positionals } = parseArgs({ allowPositionals: true, options: {} });
  const issueId = positionals[0];
  if (!issueId) {
    console.error("Usage: pnpm tsx scripts/newsletter/retry-failed.ts <issueId>");
    process.exit(1);
  }

  if (!process.env.DATABASE_URL?.trim()) {
    console.error("DATABASE_URL is not set. Run: set -a && . ./.env.local && set +a");
    process.exit(1);
  }

  const { db } = await import("../../lib/db/client");
  const schema = await import("../../lib/db/schema");
  const { and, eq } = await import("drizzle-orm");
  const { chunk } = await import("../../lib/newsletter/recipients");
  const { getBoss, SEND_BATCH_QUEUE } = await import("../../lib/queue/boss");

  const failed = await db
    .select({ contactId: schema.newsletterSends.contactId })
    .from(schema.newsletterSends)
    .where(
      and(
        eq(schema.newsletterSends.issueId, issueId),
        eq(schema.newsletterSends.status, "failed"),
      ),
    );
  if (!failed.length) {
    console.log("No hay envíos fallidos para reintentar.");
    process.exit(0);
  }

  await db
    .update(schema.newsletterSends)
    .set({ status: "pending", error: null, updatedAt: new Date() })
    .where(
      and(
        eq(schema.newsletterSends.issueId, issueId),
        eq(schema.newsletterSends.status, "failed"),
      ),
    );

  await db
    .update(schema.newsletterIssues)
    .set({ status: "sending", sentAt: null, updatedAt: new Date() })
    .where(eq(schema.newsletterIssues.id, issueId));

  const ids = failed.map((r) => r.contactId);
  const boss = await getBoss();
  let jobs = 0;
  for (const group of chunk(ids)) {
    await boss.send(SEND_BATCH_QUEUE, { issueId, contactIds: group });
    jobs++;
  }

  console.log(`Reintentando ${ids.length} envíos en ${jobs} batches. El worker los drena throttleado.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
