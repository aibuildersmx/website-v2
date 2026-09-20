/**
 * Re-check coupons against Cursor and write back what it says.
 *
 * Cursor has no redemption webhook, so this poll is the only thing that ever
 * turns a handed-out coupon into a redeemed one. Run it on a schedule.
 *
 *   pnpm coupons:refresh              # up to 50 stale coupons
 *   pnpm coupons:refresh --limit 300  # a full sweep
 */

export {}; // keep this a module; otherwise `main` collides in the global scope

async function main() {
  const args = process.argv.slice(2);
  const limitFlag = args.indexOf("--limit");
  const limit = limitFlag === -1 ? 50 : Number.parseInt(args[limitFlag + 1] ?? "50", 10);

  if (!Number.isFinite(limit) || limit < 1) {
    console.error("--limit debe ser un entero positivo");
    process.exit(1);
  }

  const { refreshStale } = await import("@/lib/coupons/queries");

  const results = await refreshStale({ limit });
  if (!results.length) {
    console.log("nada que re-verificar.");
    return;
  }

  const tally = results.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`${results.length} cupones re-verificados:`);
  for (const [status, n] of Object.entries(tally).sort()) console.log(`  ${status.padEnd(12)} ${n}`);

  const newlyDead = results.filter((r) => r.status === "used" || r.status === "invalid");
  if (newlyDead.length) console.log(`\n${newlyDead.length} marcados como redimidos.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
