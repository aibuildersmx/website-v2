import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const ENV = { AIBY_API_BASE: "https://bot.example", AIBY_API_KEY: "secret-key" };

describe("aiby client", () => {
  beforeEach(() => {
    process.env.AIBY_API_BASE = ENV.AIBY_API_BASE;
    process.env.AIBY_API_KEY = ENV.AIBY_API_KEY;
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.AIBY_API_BASE;
    delete process.env.AIBY_API_KEY;
  });

  it("calls the right URL with the api key header and query params", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ totals: { messages: 1 } }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const { getOverview } = await import("@/lib/aiby/client");

    await getOverview({ preset: "week", group: "general" });

    const [url, opts] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://bot.example/dashboard/api/overview?preset=week&group=general");
    expect((opts.headers as Record<string, string>)["x-api-key"]).toBe("secret-key");
  });

  it("omits group when not provided", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getVolume } = await import("@/lib/aiby/client");
    await getVolume({ preset: "month" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/volume?preset=month",
    );
  });

  it("throws AibyApiError with status on non-2xx", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("nope", { status: 401 })));
    const { getOverview, AibyApiError } = await import("@/lib/aiby/client");
    await expect(getOverview({ preset: "day" })).rejects.toMatchObject({ status: 401 });
    await expect(getOverview({ preset: "day" })).rejects.toBeInstanceOf(AibyApiError);
  });

  it("throws a clear error when env is missing", async () => {
    delete process.env.AIBY_API_BASE;
    vi.stubGlobal("fetch", vi.fn());
    const { getOverview } = await import("@/lib/aiby/client");
    await expect(getOverview({ preset: "day" })).rejects.toThrow(/AIBY_API_BASE/);
  });
});
