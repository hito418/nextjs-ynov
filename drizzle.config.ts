import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// drizzle-kit reads db/schema.ts to generate and apply SQL migrations against
// the local SQLite file. better-sqlite3 is the default driver for the "sqlite"
// dialect, so no extra driver config is needed.
const url = (process.env.DATABASE_URL ?? "file:./dev.db").replace(/^file:/, "");

export default defineConfig({
  dialect: "sqlite",
  schema: "./db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
