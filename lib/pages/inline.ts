// Turns an HTML file that references sibling assets (src="photos/a.jpg") into a
// single self-contained document, so a private page can live in one DB row.
// Only relative paths are touched; absolute URLs and existing data: URIs stay.

const MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
};

const ASSET_ATTR = /\b((?:data-)?src)="([^"]+)"/g;

function isRelative(path: string): boolean {
  return !/^(?:[a-z][a-z0-9+.-]*:|\/\/|\/|#)/i.test(path);
}

export function inlineAssets(html: string, readAsset: (path: string) => Buffer): string {
  return html.replace(ASSET_ATTR, (match, attr: string, path: string) => {
    const ext = path.split(".").pop()?.toLowerCase() ?? "";
    const mime = MIME[ext];
    if (!mime || !isRelative(path)) return match;
    return `${attr}="data:${mime};base64,${readAsset(path).toString("base64")}"`;
  });
}
