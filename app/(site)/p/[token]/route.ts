import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { privatePages } from "@/lib/db/schema";

// Private pages (pitch decks, one-off docs): GET /p/<token> serves the stored
// self-contained HTML. Unlisted, not indexed, not cached by anything shared.
// Publish with `pnpm pages:publish` — the content never goes into git.

const PRIVATE_HEADERS = {
  "cache-control": "private, no-store",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "referrer-policy": "no-referrer",
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;
  const [page] = await db
    .select({ html: privatePages.html })
    .from(privatePages)
    .where(eq(privatePages.token, token))
    .limit(1);

  if (!page) {
    return new Response("No encontrado.", {
      status: 404,
      headers: { ...PRIVATE_HEADERS, "content-type": "text/plain; charset=utf-8" },
    });
  }

  return new Response(page.html, {
    headers: { ...PRIVATE_HEADERS, "content-type": "text/html; charset=utf-8" },
  });
}
