"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { getOverlay, upsertCommunityPerson, searchContacts } from "@/lib/db/queries/community-people";
import { patchPersonName } from "@/lib/aiby/client";

const LIST_PATH = "/admin/comunidad/personas";

function norm(s: string | null): string | null {
  if (s === null) return null;
  const t = s.trim();
  return t === "" ? null : t;
}

export async function saveCommunityPerson(
  jid: string,
  data: {
    displayName: string | null;
    contactId: string | null;
    notes: string | null;
    tags: string[];
    phone: string | null;
  },
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "No autorizado." };

  const displayName = norm(data.displayName);
  const notes = norm(data.notes);
  const tags = data.tags.map((t) => t.trim()).filter((t) => t !== "");

  const prev = await getOverlay(jid);
  const nameChanged = (prev?.displayName ?? null) !== displayName;

  await upsertCommunityPerson({
    jid,
    displayName,
    contactId: data.contactId,
    notes,
    tags,
    phone: norm(data.phone),
  });

  if (nameChanged) {
    try {
      await patchPersonName(jid, displayName);
    } catch (e) {
      console.error("[community] name sync to bot failed:", e);
    }
  }

  revalidatePath(LIST_PATH);
  revalidatePath(`${LIST_PATH}/[jid]`, "page");
  return { ok: true };
}

export async function searchContactsAction(
  q: string,
): Promise<Array<{ id: string; email: string; name: string | null }>> {
  const user = await getUser();
  if (!user) return [];
  return searchContacts(q);
}
