/**
 * Import Cursor coupon codes into Postgres.
 *
 * Codes are money, and this repo is public, so the codes are NOT checked in.
 * Pass a TSV exported from the old MySQL tables:
 *
 *   batch <TAB> code <TAB> is_used <TAB> used_at <TAB> live_status
 *
 * `live_status` is what Cursor said when the row was last verified
 * (AVAILABLE | USED | INVALID). It wins over the legacy `is_used` flag, which
 * only ever meant "we emailed it".
 *
 *   pnpm coupons:import /path/to/coupons-seed.tsv
 *   pnpm coupons:import /path/to/coupons-seed.tsv --dry-run
 */

import { readFileSync } from "node:fs";
import { sql } from "drizzle-orm";

const VALUE_CENTS: Record<string, number> = {
  aibm: 2000,
  cafe_cursor_toronto: 5000,
};

type Parsed = {
  batch: string;
  code: string;
  sentAt: Date | null;
  redeemedAt: Date | null;
  checkStatus: string;
  valueCents: number;
};

export function parseLine(line: string, now: Date): Parsed | null {
  const parts = line.split("\t");
  if (parts.length < 5) return null;

  const [batchRaw, codeRaw, isUsedRaw, usedAtRaw, statusRaw] = parts;
  const batch = batchRaw.trim();
  // Strip the stray \r that the original CSV import left on 293 of 300 rows.
  const code = codeRaw.replace(/[\r\n]/g, "").trim();
  if (!batch || !code) return null;

  const status = statusRaw.trim().toUpperCase();
  const wasEmailed = isUsedRaw.trim() === "1";
  const usedAt = usedAtRaw.trim() ? new Date(usedAtRaw.trim().replace(" ", "T") + "Z") : null;

  return {
    batch,
    code,
    // The old flag was set when we emailed the code — that is exactly `sent_at`.
    sentAt: wasEmailed ? (usedAt ?? now) : null,
    // Only Cursor's verdict may mark a coupon spent.
    redeemedAt: status === "USED" || status === "INVALID" ? (usedAt ?? now) : null,
    checkStatus: status.toLowerCase(),
    valueCents: VALUE_CENTS[batch] ?? 0,
  };
}

async function main() {
  const [file, ...flags] = process.argv.slice(2);
  if (!file) {
    console.error("uso: pnpm coupons:import <archivo.tsv> [--dry-run]");
    process.exit(1);
  }
  const dryRun = flags.includes("--dry-run");
  const now = new Date();

  const rows = readFileSync(file, "utf8")
    .split("\n")
    .map((l) => parseLine(l, now))
    .filter((r): r is Parsed => r !== null);

  if (!rows.length) {
    console.error("no se parseó ninguna fila; ¿el TSV tiene las 5 columnas?");
    process.exit(1);
  }

  const unknownBatch = rows.filter((r) => r.valueCents === 0);
  if (unknownBatch.length) {
    const names = [...new Set(unknownBatch.map((r) => r.batch))].join(", ");
    console.error(`batch sin valor conocido: ${names}. Agrégalo a VALUE_CENTS.`);
    process.exit(1);
  }

  const summary = rows.reduce<Record<string, number>>((acc, r) => {
    const key = `${r.batch}/${r.redeemedAt ? "redeemed" : r.sentAt ? "sent" : "claimable"}`;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  console.log(`${rows.length} cupones parseados:`);
  for (const [key, n] of Object.entries(summary).sort()) console.log(`  ${key.padEnd(34)} ${n}`);

  if (dryRun) {
    console.log("\n--dry-run: no se escribió nada.");
    return;
  }

  // Imported lazily so tests can load `parseLine` without a DATABASE_URL.
  const { db } = await import("@/lib/db/client");
  const { couponCodes } = await import("@/lib/db/schema");

  // Idempotent: re-running refreshes state without duplicating codes.
  await db
    .insert(couponCodes)
    .values(
      rows.map((r) => ({
        code: r.code,
        batch: r.batch,
        valueCents: r.valueCents,
        sentAt: r.sentAt,
        redeemedAt: r.redeemedAt,
        checkedAt: now,
        checkStatus: r.checkStatus,
      })),
    )
    .onConflictDoUpdate({
      target: couponCodes.code,
      set: {
        batch: sql`excluded.batch`,
        valueCents: sql`excluded.value_cents`,
        sentAt: sql`excluded.sent_at`,
        redeemedAt: sql`excluded.redeemed_at`,
        checkedAt: sql`excluded.checked_at`,
        checkStatus: sql`excluded.check_status`,
        updatedAt: now,
      },
    });

  console.log(`\nlisto: ${rows.length} cupones en Postgres.`);
}

// Only run when invoked directly, so tests can import `parseLine`.
if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
