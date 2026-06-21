import { describe, it, expect, beforeEach, vi } from "vitest";

const getUser = vi.fn();
const getOverlay = vi.fn();
const upsertCommunityPerson = vi.fn();
const searchContacts = vi.fn();
const patchPersonName = vi.fn();
const revalidatePath = vi.fn();

vi.mock("@/lib/auth", () => ({ getUser }));
vi.mock("@/lib/db/queries/community-people", () => ({ getOverlay, upsertCommunityPerson, searchContacts }));
vi.mock("@/lib/aiby/client", () => ({
  patchPersonName,
  AibyApiError: class AibyApiError extends Error { status = 500; },
}));
vi.mock("next/cache", () => ({ revalidatePath }));

const data = { displayName: "Ana", contactId: null, notes: null, tags: [], phone: "52" };

describe("saveCommunityPerson", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ id: "u1" });
    getOverlay.mockResolvedValue(null);
    upsertCommunityPerson.mockResolvedValue(undefined);
    patchPersonName.mockResolvedValue({ ok: true });
  });

  it("rejects when not authenticated", async () => {
    getUser.mockResolvedValue(null);
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    expect(await saveCommunityPerson("1@s", data)).toEqual({ error: "No autorizado." });
    expect(upsertCommunityPerson).not.toHaveBeenCalled();
  });

  it("upserts and pushes the name to the bot when the name changed", async () => {
    getOverlay.mockResolvedValue({ jid: "1@s", displayName: "Old", notes: null, tags: [], contact: null });
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    expect(await saveCommunityPerson("1@s", data)).toEqual({ ok: true });
    expect(upsertCommunityPerson).toHaveBeenCalledOnce();
    expect(patchPersonName).toHaveBeenCalledWith("1@s", "Ana");
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("does NOT push to the bot when the name is unchanged", async () => {
    getOverlay.mockResolvedValue({ jid: "1@s", displayName: "Ana", notes: null, tags: [], contact: null });
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    await saveCommunityPerson("1@s", data);
    expect(upsertCommunityPerson).toHaveBeenCalledOnce();
    expect(patchPersonName).not.toHaveBeenCalled();
  });

  it("still returns ok when the bot push fails (Postgres is source of truth)", async () => {
    getOverlay.mockResolvedValue({ jid: "1@s", displayName: "Old", notes: null, tags: [], contact: null });
    patchPersonName.mockRejectedValue(new Error("bot down"));
    const { saveCommunityPerson } = await import("@/lib/actions/community");
    expect(await saveCommunityPerson("1@s", data)).toEqual({ ok: true });
    expect(upsertCommunityPerson).toHaveBeenCalledOnce();
  });
});

describe("searchContactsAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUser.mockResolvedValue({ id: "u1" });
  });

  it("returns [] when not authenticated", async () => {
    getUser.mockResolvedValue(null);
    const { searchContactsAction } = await import("@/lib/actions/community");
    expect(await searchContactsAction("ana")).toEqual([]);
    expect(searchContacts).not.toHaveBeenCalled();
  });

  it("delegates to searchContacts when authenticated", async () => {
    searchContacts.mockResolvedValue([{ id: "c1", email: "a@b.com", name: "Ana" }]);
    const { searchContactsAction } = await import("@/lib/actions/community");
    expect(await searchContactsAction("ana")).toEqual([{ id: "c1", email: "a@b.com", name: "Ana" }]);
    expect(searchContacts).toHaveBeenCalledWith("ana");
  });
});
