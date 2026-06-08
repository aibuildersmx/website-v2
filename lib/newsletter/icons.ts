// On-demand Phosphor → PNG rasterizer for newsletter use-case icons.
//
// Email clients (Gmail, Outlook) strip inline SVG, so icons must be <img> PNGs
// at an absolute URL. Rather than pre-generating and committing a PNG every time
// someone adds an icon in the composer, the email points at a route that calls
// `rasterizePhosphor(name)` on demand: it fetches the Phosphor SVG, recolors it,
// and rasterizes it with sharp. New icon names "just work" on the next send.
//
// `UseCase.icon` holds the Phosphor icon name (kebab-case, e.g. "tree-structure").

import sharp from "sharp";

const PHOSPHOR_CDN = "https://cdn.jsdelivr.net/npm/@phosphor-icons/core@2/assets/regular";
const ICON_COLOR = "#f4f4f4"; // matches the email's TEXT color on the dark surface
const SIZE = 96; // rendered @ ~24px in the email, so 96 is crisp on retina

// Phosphor names are kebab-case ASCII — reject anything else so the name can't
// be used to fetch arbitrary URLs.
export function isValidIconName(name: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name);
}

const cache = new Map<string, Buffer>();

export class UnknownIconError extends Error {}

/** Fetch + recolor + rasterize a Phosphor icon to a white PNG buffer (cached). */
export async function rasterizePhosphor(name: string): Promise<Buffer> {
  if (!isValidIconName(name)) {
    throw new UnknownIconError(`Nombre de ícono inválido: "${name}".`);
  }
  const cached = cache.get(name);
  if (cached) return cached;

  const res = await fetch(`${PHOSPHOR_CDN}/${name}.svg`);
  if (!res.ok) {
    throw new UnknownIconError(
      `El ícono Phosphor "${name}" no existe (HTTP ${res.status}). Revisa el nombre en https://phosphoricons.com.`,
    );
  }
  const svg = (await res.text()).replaceAll("currentColor", ICON_COLOR);
  const png = await sharp(Buffer.from(svg), { density: 384 })
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  cache.set(name, png);
  return png;
}
