"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { getUserByEmail, type AuthUser } from "@/lib/auth/users";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession, getSessionUser } from "@/lib/auth/session";

export async function signIn(formData: FormData) {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";

  if (!email || !password) {
    return { error: "Correo y contraseña son obligatorios." };
  }

  const user = await getUserByEmail(db, email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Credenciales incorrectas. Intenta de nuevo." };
  }

  await createSession(db, user.id);
  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signOut() {
  await destroySession(db);
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getUser(): Promise<AuthUser | null> {
  return getSessionUser(db);
}
