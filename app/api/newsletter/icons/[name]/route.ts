import { rasterizePhosphor, UnknownIconError } from "@/lib/newsletter/icons";

// GET /api/newsletter/icons/<phosphor-name>.png
// Rasterizes a Phosphor icon to a white PNG on demand (used by newsletter emails,
// which can't render inline SVG). Heavily cacheable — the same name always maps
// to the same image, so Gmail's proxy fetches it once.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const { name } = await params;
  const clean = name.replace(/\.png$/i, "");

  try {
    const png = await rasterizePhosphor(clean);
    return new Response(new Uint8Array(png), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (e) {
    if (e instanceof UnknownIconError) {
      return new Response(e.message, { status: 404 });
    }
    throw e;
  }
}
