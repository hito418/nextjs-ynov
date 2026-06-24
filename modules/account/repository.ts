import "server-only";
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
