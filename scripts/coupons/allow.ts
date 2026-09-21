/**
 * Load an event's guest list, so its attendees can claim a coupon at /creditos/<slug>.
 *
 * Takes Luma's guest CSV export (Manage event → Guests → Download as CSV).
 * Guest emails are PII and this repo is public: keep the CSV out of git.
 *
 *   pnpm coupons:allow mexicocity_2026 ~/Downloads/guests.csv --checked-in-only
 *   pnpm coupons:allow mexicocity_2026 ~/Downloads/guests.csv --dry-run
 *
 * Idempotent: re-running with a newer export only adds the new emails.
 */

import { readFileSync } from "node:fs";
import { parseArgs } from "node:util";
import { parseLumaGuests } from "@/lib/coupons/luma";

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      "checked-in-only": { type: "boolean", default: false },
      "dry-run": { type: "boolean", default: false },
    },
  });
  const [batch, file] = positionals;
  if (!batch || !file) {
    console.error("uso: pnpm coupons:allow <batch> <luma.csv> [--checked-in-only] [--dry-run]");
    process.exit(1);
  }

  const guests = parseLumaGuests(readFileSync(file, "utf8"), { checkedInOnly: values["checked-in-only"] });
  console.log(`${guests.length} invitados${values["checked-in-only"] ? " con check-in" : " aprobados"} para ${batch}.`);
  if (!guests.length) process.exit(1);

  if (values["dry-run"]) {
    console.log("--dry-run: no se escribió nada.");
    return;
  }

  // Imported lazily so --dry-run works without a DATABASE_URL. Talks to the DB
  // directly: lib/coupons/queries is server-only and won't load under tsx.
  const { and, count, eq, isNull } = await import("drizzle-orm");
  const { db } = await import("@/lib/db/client");
  const { couponCodes, couponEligible } = await import("@/lib/db/schema");

  const inserted = await db
    .insert(couponEligible)
    .values(guests.map((g) => ({ batch, email: g.email, name: g.name })))
    .onConflictDoNothing({ target: [couponEligible.batch, couponEligible.email] })
    .returning({ id: couponEligible.id });
  console.log(`listo: ${inserted.length} nuevos (${guests.length - inserted.length} ya estaban).`);

  const [{ claimable }] = await db
    .select({ claimable: count() })
    .from(couponCodes)
    .where(and(eq(couponCodes.batch, batch), isNull(couponCodes.sentAt), isNull(couponCodes.redeemedAt)));
  if (claimable < guests.length) {
    console.warn(`ojo: solo quedan ${claimable} códigos sin repartir en ${batch} para ${guests.length} invitados.`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
