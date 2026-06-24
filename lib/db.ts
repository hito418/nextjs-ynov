import "server-only";
import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database as DB } from "@/db/types";

// Runtime data access: a Kysely query builder over better-sqlite3. We keep a
// single instance across hot-reloads in dev. Migrations are handled separately
// by drizzle-kit (see db/schema.ts + drizzle.config.ts).
const globalForDb = globalThis as unknown as {
  db?: Kysely<DB>;
};

/** Turn a `file:./dev.db` connection string into a plain path for better-sqlite3. */
function resolveSqlitePath(): string {
  const url = process.env.DATABASE_URL ?? "file:./dev.db";
  return url.replace(/^file:/, "");
}

function createDb(): Kysely<DB> {
  const dialect = new SqliteDialect({
    database: new Database(resolveSqlitePath()),
  });
  return new Kysely<DB>({ dialect });
}

export const db = globalForDb.db ?? createDb();

if (process.env.NODE_ENV !== "production") {
  globalForDb.db = db;
}
