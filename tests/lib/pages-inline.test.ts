import { describe, expect, it } from "vitest";
import { inlineAssets } from "@/lib/pages/inline";

const read = (path: string) => Buffer.from(`bytes:${path}`);
const b64 = (path: string) => Buffer.from(`bytes:${path}`).toString("base64");

describe("inlineAssets", () => {
  it("inlines relative src and data-src images", () => {
    const html = `<img src="photos/a.jpg"><img data-src="photos/b.png">`;
    expect(inlineAssets(html, read)).toBe(
      `<img src="data:image/jpeg;base64,${b64("photos/a.jpg")}">` +
        `<img data-src="data:image/png;base64,${b64("photos/b.png")}">`,
    );
  });

  it("leaves absolute URLs, root paths and data URIs alone", () => {
    const html = `<img src="https://x.com/a.jpg"><img src="/a.jpg"><img src="data:image/png;base64,AA">`;
    expect(inlineAssets(html, read)).toBe(html);
  });

  it("leaves non-asset srcs alone", () => {
    const html = `<script src="app.js"></script>`;
    expect(inlineAssets(html, read)).toBe(html);
  });
});
