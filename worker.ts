import {
  getBoss,
  SEND_BATCH_QUEUE,
  SEND_BATCH_DLQ,
  type SendBatchJob,
} from "@/lib/queue/boss";
import { db } from "@/lib/db/client";
import { loadNewsletterConfig } from "@/lib/newsletter/resend";
import { processSendBatch, failBatch } from "@/lib/newsletter/send-batch";

// Resend's rate limit is 5 requests/second. Each batch is ONE request (up to 100
// emails), so we process batches serially (localConcurrency: 1) and pause between
// them to stay comfortably under the limit — ~3 req/s.
const THROTTLE_MS = 300;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const boss = await getBoss();
  const cfg = loadNewsletterConfig(); // fail fast if Resend env is missing

  await boss.work<SendBatchJob>(
    SEND_BATCH_QUEUE,
    { batchSize: 1, localConcurrency: 1 },
    async (jobs) => {
      for (const job of jobs) {
        await processSendBatch(
          { db, resend: cfg.resend, from: cfg.from, replyTo: cfg.replyTo },
          job.data,
        );
        await sleep(THROTTLE_MS); // throttle to stay under Resend's 5 req/s
      }
    },
  );

  await boss.work<SendBatchJob>(
    SEND_BATCH_DLQ,
    { batchSize: 1, localConcurrency: 1 },
    async (jobs) => {
      for (const job of jobs) {
        await failBatch(db, job.data);
      }
    },
  );

  console.log("[worker] newsletter queue worker running");
}

main().catch((e) => {
  console.error("[worker] fatal", e);
  process.exit(1);
});
