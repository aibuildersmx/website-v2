import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

describe("aiby client — list + detail", () => {
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

  it("getTopics passes offset + limit + range", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getTopics } = await import("@/lib/aiby/client");
    await getTopics({ preset: "week" }, { offset: 25, limit: 25 });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/topics?preset=week&offset=25&limit=25",
    );
  });

  it("getPeople defaults offset to 0", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getPeople } = await import("@/lib/aiby/client");
    await getPeople({ preset: "month", group: "general" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/people?preset=month&group=general&offset=0&limit=25",
    );
  });

  it("getTopic encodes the slug in the path", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getTopic } = await import("@/lib/aiby/client");
    await getTopic("pi sdk", { preset: "week" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/topic/pi%20sdk?preset=week",
    );
  });

  it("getPerson encodes the jid in the path", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const { getPerson } = await import("@/lib/aiby/client");
    await getPerson("12345@lid", { preset: "year" });
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://bot.example/dashboard/api/person/12345%40lid?preset=year",
    );
  });
});
