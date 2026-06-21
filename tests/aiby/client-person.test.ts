import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("aiby client — patchPersonName", () => {
  beforeEach(() => {
    process.env.AIBY_API_BASE = "https://bot.example";
    process.env.AIBY_API_KEY = "secret-key";
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.AIBY_API_BASE;
    delete process.env.AIBY_API_KEY;
  });

  it("PATCHes the jid with a curated_name body + api key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, jid: "1@s", curated_name: "Ana" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { patchPersonName } = await import("@/lib/aiby/client");
    const res = await patchPersonName("1@s", "Ana");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://bot.example/dashboard/api/person/1%40s");
    expect(opts.method).toBe("PATCH");
    expect((opts.headers as Record<string, string>)["x-api-key"]).toBe("secret-key");
    expect(JSON.parse(opts.body as string)).toEqual({ curated_name: "Ana" });
    expect(res).toEqual({ ok: true, jid: "1@s", curated_name: "Ana" });
  });

  it("forwards a null curated_name (clearing)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, jid: "1@s", curated_name: null }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { patchPersonName } = await import("@/lib/aiby/client");
    await patchPersonName("1@s", null);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string)).toEqual({ curated_name: null });
  });

  it("throws AibyApiError on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 500 })));
    const { patchPersonName, AibyApiError } = await import("@/lib/aiby/client");
    await expect(patchPersonName("1@s", "x")).rejects.toBeInstanceOf(AibyApiError);
  });
});
