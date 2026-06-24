"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/modules/account/auth";
import { landingPath, type UserRole } from "@/modules/account/domain/user";

export type SignInState = { error?: string };

// Server Action: validates credentials, opens a session, redirects into admin.
// Reachable via direct POST, so it re-checks everything server-side.
export async function signInAction(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email et mot de passe requis." };
  }

  const account = await db
    .selectFrom("users")
    .select(["id", "role", "password_hash"])
    .where("email", "=", email)
    .executeTakeFirst();

  // Same generic message whether the email is unknown or the password is wrong.
  if (
    !account ||
    !account.password_hash ||
    !verifyPassword(password, account.password_hash)
  ) {
    return { error: "Identifiants invalides." };
  }

  await createSession(account.id);
  // Staff land in the back-office, customers on the storefront.
  redirect(landingPath(account.role as UserRole));
}

// Server Action: ends the session and returns to the storefront.
export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
