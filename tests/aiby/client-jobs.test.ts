import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("aiby client — jobs + showcase", () => {
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

  it("getJobs forwards mode/status/search filters and skips blanks", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getJobs } = await import("@/lib/aiby/client");
    await getJobs({ preset: "month" }, { mode: "remote", status: "open", search: "", limit: 50 });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/jobs?preset=month&mode=remote&status=open&limit=50",
    );
  });

  it("getShowcase forwards the limit", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getShowcase } = await import("@/lib/aiby/client");
    await getShowcase({ preset: "week" }, 20);
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/showcase?preset=week&limit=20",
    );
  });

  it("patchJobStatus PATCHes the id with a JSON status body + api key", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, id: 7, status: "closed" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { patchJobStatus } = await import("@/lib/aiby/client");
    const res = await patchJobStatus(7, "closed");
    const [url, opts] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://bot.example/dashboard/api/jobs/7");
    expect(opts.method).toBe("PATCH");
    expect((opts.headers as Record<string, string>)["x-api-key"]).toBe("secret-key");
    expect((opts.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opts.body as string)).toEqual({ status: "closed" });
    expect(res).toEqual({ ok: true, id: 7, status: "closed" });
  });

  it("patchJobStatus throws AibyApiError on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("no", { status: 500 })));
    const { patchJobStatus, AibyApiError } = await import("@/lib/aiby/client");
    await expect(patchJobStatus(1, "hidden")).rejects.toBeInstanceOf(AibyApiError);
  });
});
