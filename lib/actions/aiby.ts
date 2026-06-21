"use server";

import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { patchJobStatus, AibyApiError } from "@/lib/aiby/client";
import type { JobStatus } from "@/lib/aiby/types";

const JOBS_PATH = "/admin/comunidad/jobs";
const VALID: JobStatus[] = ["open", "closed", "hidden"];

export async function updateJobStatus(
  id: number,
  status: JobStatus,
): Promise<{ ok: true } | { error: string }> {
  const user = await getUser();
  if (!user) return { error: "No autorizado." };
  if (!VALID.includes(status)) return { error: "Status inválido." };

  try {
    await patchJobStatus(id, status);
  } catch (e) {
    const msg = e instanceof AibyApiError ? `Error del bot (${e.status}).` : "No se pudo actualizar.";
    return { error: msg };
  }

  revalidatePath(JOBS_PATH);
  return { ok: true };
}
