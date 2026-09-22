/**
 * Publish a self-contained HTML page at aibuilders.mx/p/<token>.
 *
 * Relative image paths (src / data-src) are inlined as data: URIs, so the file
 * and its assets end up in a single DB row. Keep the source files OUT of this
 * repo — it's public; the DB is the only place the content lives.
 *
 *   pnpm pages:publish ~/pitch/deck.html --title "AI Builders Nights"
 *   pnpm pages:publish ~/pitch/deck.html --token <existing>   # update in place
 *   pnpm pages:publish --list
 *   pnpm pages:publish --delete <token>
 */

import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseArgs } from "node:util";
import { inlineAssets } from "@/lib/pages/inline";

const BASE_URL = "https://aibuilders.mx/p/";

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      title: { type: "string" },
      token: { type: "string" },
      list: { type: "boolean", default: false },
      delete: { type: "string" },
    },
  });

  const { eq, sql } = await import("drizzle-orm");
  const { db } = await import("@/lib/db/client");
  const { privatePages } = await import("@/lib/db/schema");

  if (values.list) {
    const rows = await db
      .select({ token: privatePages.token, title: privatePages.title, updatedAt: privatePages.updatedAt })
      .from(privatePages);
    for (const r of rows) console.log(`${BASE_URL}${r.token}  ${r.title}  (${r.updatedAt.toISOString()})`);
    if (!rows.length) console.log("no hay páginas privadas.");
    return;
  }

  if (values.delete) {
    const gone = await db.delete(privatePages).where(eq(privatePages.token, values.delete)).returning();
    console.log(gone.length ? `borrada: ${values.delete}` : `no existe: ${values.delete}`);
    return;
  }

  const [file] = positionals;
  if (!file) {
    console.error('uso: pnpm pages:publish <archivo.html> [--title "…"] [--token <token>] | --list | --delete <token>');
    process.exit(1);
  }

  const path = resolve(file);
  const dir = dirname(path);
  const html = inlineAssets(readFileSync(path, "utf8"), (asset) => readFileSync(resolve(dir, asset)));
  const title = values.title ?? html.match(/<title>([^<]*)<\/title>/i)?.[1]?.trim() ?? "Sin título";
  const token = values.token ?? randomBytes(18).toString("base64url");

  await db
    .insert(privatePages)
    .values({ token, title, html })
    .onConflictDoUpdate({ target: privatePages.token, set: { title, html, updatedAt: sql`now()` } });

  console.log(`publicada (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MB): ${BASE_URL}${token}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
