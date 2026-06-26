"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/modules/account/auth";
import { createUser, getUserByEmail } from "@/modules/account/repository";
import { landingPath, type UserRole } from "@/modules/account/domain/user";

export type SignInState = { error?: string };
export type SignUpState = { error?: string };

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

// Server Action: registers a new customer account, then opens a session.
// Re-validates everything server-side since it's reachable via direct POST.
export async function signUpAction(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name || !email || !password) {
    return { error: "Tous les champs sont requis." };
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { error: "Adresse email invalide." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit faire au moins 8 caractères." };
  }
  if (await getUserByEmail(email)) {
    return { error: "Un compte existe déjà avec cette adresse." };
  }

  const user = await createUser({
    email,
    name,
    passwordHash: hashPassword(password),
  });

  await createSession(user.id);
  // New accounts are always customers → land on the storefront.
  redirect("/");
}

// Server Action: ends the session and returns to the storefront.
export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}
