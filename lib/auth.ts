"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function isRecruiterEmail(email: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return false;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("recruiters")
    .select("email")
    .eq("email", normalizedEmail)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Failed to validate recruiter allowlist:", error);
    return false;
  }

  return Boolean(data);
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Credenciales incorrectas. Intenta de nuevo." };
  }

  const userEmail = user?.email ?? "";
  const isRecruiter = await isRecruiterEmail(userEmail);
  if (!isRecruiter) {
    await supabase.auth.signOut();
    return {
      error:
        "Tu cuenta no tiene permisos para publicar vacantes. Contacta al equipo de AI Builders.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/job-board/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return null;
  }

  const isRecruiter = await isRecruiterEmail(user.email);
  if (!isRecruiter) {
    return null;
  }

  return user;
}
