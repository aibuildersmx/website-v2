"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

const RECRUITERS_PATH = "/job-board/dashboard/recruiters";

// Recruiter management is open to any logged-in admin — access is currently
// flat (every authenticated user is an admin). The gate only requires a valid
// session; it no longer restricts to a single super-admin email.
async function requireRecruiter() {
  const user = await getUser();
  if (!user?.email) {
    return { error: "No autorizado." as const };
  }

  return { userEmail: user.email.trim().toLowerCase() };
}

async function getBaseUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";

  if (host) return `${protocol}://${host}`;
  return "http://localhost:3000";
}

export async function getRecruiters() {
  const auth = await requireRecruiter();
  if ("error" in auth) return [];

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recruiters")
    .select("email, is_active, created_at, last_invited_at")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data;
}

export type AddRecruiterState =
  | { error?: string; success?: boolean; message?: string }
  | { error: string }
  | { success: true; message: string };

export async function addRecruiter(
  _prevState: AddRecruiterState,
  formData: FormData
): Promise<AddRecruiterState> {
  const auth = await requireRecruiter();
  if ("error" in auth) return { error: auth.error };

  const emailRaw = String(formData.get("email") || "").trim().toLowerCase();
  if (!emailRaw || !emailRaw.includes("@")) {
    return { error: "Ingresa un correo valido." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("recruiters").upsert(
    {
      email: emailRaw,
      is_active: true,
    } as never,
    { onConflict: "email" }
  );

  if (error) {
    return { error: "No se pudo guardar el correo." };
  }

  const redirectTo = `${await getBaseUrl()}/login`;
  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    emailRaw,
    {
      redirectTo,
    }
  );

  if (inviteError) {
    const inviteMessage = inviteError.message.toLowerCase();
    if (
      inviteMessage.includes("already") ||
      inviteMessage.includes("registered")
    ) {
      revalidatePath(RECRUITERS_PATH);
      return {
        success: true,
        message:
          "El correo ya existe en Auth. Acceso habilitado o actualizado correctamente.",
      };
    }

    revalidatePath(RECRUITERS_PATH);
    return {
      error:
        "Acceso guardado, pero no se pudo enviar invitacion automaticamente. Puedes invitarlo desde Supabase Auth.",
    };
  }

  await admin
    .from("recruiters")
    .update({ last_invited_at: new Date().toISOString() } as never)
    .eq("email", emailRaw);

  revalidatePath(RECRUITERS_PATH);
  return {
    success: true,
    message: "Invitacion enviada y acceso habilitado correctamente.",
  };
}

export async function toggleRecruiterStatus(
  formData: FormData
): Promise<void> {
  const auth = await requireRecruiter();
  if ("error" in auth) return;

  const email = String(formData.get("email") || "").trim().toLowerCase();
  const nextActive = String(formData.get("nextActive") || "false") === "true";

  if (!email) return;
  if (email === auth.userEmail && !nextActive) {
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("recruiters")
    .update({ is_active: nextActive } as never)
    .eq("email", email);

  if (error) return;

  revalidatePath(RECRUITERS_PATH);
}

export async function deleteRecruiter(formData: FormData): Promise<void> {
  const auth = await requireRecruiter();
  if ("error" in auth) return;

  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return;
  if (email === auth.userEmail) return;

  const admin = createAdminClient();
  const { error } = await admin.from("recruiters").delete().eq("email", email);

  if (error) return;

  revalidatePath(RECRUITERS_PATH);
}
