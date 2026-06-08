import {
  getBoss,
  SEND_BATCH_QUEUE,
  SEND_BATCH_DLQ,
  type SendBatchJob,
} from "@/lib/queue/boss";
import { db } from "@/lib/db/client";
import { loadNewsletterConfig } from "@/lib/newsletter/resend";
import { processSendBatch, failBatch } from "@/lib/newsletter/send-batch";

async function main() {
  const boss = await getBoss();
  const cfg = loadNewsletterConfig(); // fail fast if Resend env is missing

  // batchSize: 1 → process one batch at a time, comfortably under Resend's
  // ~2 req/s limit. In pg-boss v12 the handler receives an array of jobs.
  await boss.work<SendBatchJob>(SEND_BATCH_QUEUE, { batchSize: 1 }, async (jobs) => {
    for (const job of jobs) {
      await processSendBatch(
        { db, resend: cfg.resend, from: cfg.from, replyTo: cfg.replyTo },
        job.data,
      );
    }
  });

  await boss.work<SendBatchJob>(SEND_BATCH_DLQ, { batchSize: 1 }, async (jobs) => {
    for (const job of jobs) {
      await failBatch(db, job.data);
    }
  });

  console.log("[worker] newsletter queue worker running");
}

main().catch((e) => {
  console.error("[worker] fatal", e);
  process.exit(1);
});
