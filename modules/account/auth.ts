import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import type { User, UserRole } from "./domain/user";

const COOKIE_NAME = "session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

/** Create a session row + set the httpOnly cookie. Call only from a Server Action. */
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await db
    .insertInto("sessions")
    .values({ id: token, user_id: userId, expires_at: expiresAt.toISOString() })
    .execute();

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Resolve the signed-in user from the session cookie. Wrapped in React `cache`
 * so multiple calls within one request (layout + page) hit the DB once.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const row = await db
    .selectFrom("sessions")
    .innerJoin("users", "users.id", "sessions.user_id")
    .select([
      "users.id as id",
      "users.email as email",
      "users.name as name",
      "users.role as role",
      "users.created_at as created_at",
      "sessions.expires_at as expires_at",
    ])
    .where("sessions.id", "=", token)
    .executeTakeFirst();

  if (!row) return null;

  if (new Date(row.expires_at).getTime() < Date.now()) {
    await db.deleteFrom("sessions").where("id", "=", token).execute();
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    createdAt: new Date(row.created_at),
  };
});

/** Delete the current session row + clear the cookie. Call only from a Server Action. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) {
    await db.deleteFrom("sessions").where("id", "=", token).execute();
    cookieStore.delete(COOKIE_NAME);
  }
}
