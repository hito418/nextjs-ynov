import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { User, UserRole } from "./domain/user";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
};

function toDomain(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as UserRole,
    createdAt: new Date(row.created_at),
  };
}

export async function getAllUsers(): Promise<User[]> {
  const rows = await db
    .selectFrom("users")
    .selectAll()
    .orderBy("created_at", "asc")
    .execute();
  return rows.map(toDomain);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const row = await db
    .selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
  return row ? toDomain(row) : null;
}

/**
 * Resolve a user's role straight from a session token, skipping the cookie
 * store. Used by `proxy.ts`, which reads cookies off the request (not via
 * `next/headers`) — so this helper must NOT import `next/headers`. Returns null
 * for unknown or expired sessions.
 */
export async function getRoleBySessionToken(
  token: string,
): Promise<UserRole | null> {
  const row = await db
    .selectFrom("sessions")
    .innerJoin("users", "users.id", "sessions.user_id")
    .select(["users.role as role", "sessions.expires_at as expires_at"])
    .where("sessions.id", "=", token)
    .executeTakeFirst();

  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;
  return row.role as UserRole;
}

/**
 * Create a sign-in capable account. New self-service registrations are always
 * customers — staff roles are granted manually (Drizzle Studio: `pnpm db:studio`).
 */
export async function createUser(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<User> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  await db
    .insertInto("users")
    .values({
      id,
      email: input.email,
      name: input.name,
      role: "customer",
      password_hash: input.passwordHash,
      created_at: createdAt,
    })
    .execute();

  return {
    id,
    email: input.email,
    name: input.name,
    role: "customer",
    createdAt: new Date(createdAt),
  };
}
