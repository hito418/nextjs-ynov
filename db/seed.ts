import "dotenv/config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import Database from "better-sqlite3";
import { Kysely, SqliteDialect } from "kysely";
import type { Database as DB } from "./types.js";
import { hashPassword } from "../lib/password.js";

type SeedSpec = { label: string; value: string };
type SeedProduct = {
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  image: string;
  category: string;
  featured: boolean;
  specs: SeedSpec[];
};
type SeedUser = {
  email: string;
  name: string;
  role: string;
  password?: string;
  createdAt: string;
};

const here = dirname(fileURLToPath(import.meta.url));
const readJson = <T>(...segments: string[]): T =>
  JSON.parse(readFileSync(join(here, "..", ...segments), "utf-8"));

const products = readJson<SeedProduct[]>(
  "modules",
  "catalog",
  "data",
  "products.json",
);
const users = readJson<SeedUser[]>(
  "modules",
  "account",
  "data",
  "users.json",
);

const sqlitePath = (process.env.DATABASE_URL ?? "file:./dev.db").replace(
  /^file:/,
  "",
);
const db = new Kysely<DB>({
  dialect: new SqliteDialect({ database: new Database(sqlitePath) }),
});

async function main() {
  // Idempotent: wipe then recreate so re-seeding gives a clean catalog.
  await db.deleteFrom("cart_items").execute();
  await db.deleteFrom("specifications").execute();
  await db.deleteFrom("products").execute();
  await db.deleteFrom("sessions").execute();
  await db.deleteFrom("users").execute();

  for (const p of products) {
    const id = randomUUID();
    await db
      .insertInto("products")
      .values({
        id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        price_cents: p.priceCents,
        currency: p.currency,
        image: p.image,
        category: p.category,
        featured: p.featured ? 1 : 0,
      })
      .execute();

    if (p.specs.length > 0) {
      await db
        .insertInto("specifications")
        .values(
          p.specs.map((s, position) => ({
            id: randomUUID(),
            label: s.label,
            value: s.value,
            position,
            product_id: id,
          })),
        )
        .execute();
    }
  }

  for (const u of users) {
    await db
      .insertInto("users")
      .values({
        id: randomUUID(),
        email: u.email,
        name: u.name,
        role: u.role,
        password_hash: u.password ? hashPassword(u.password) : null,
        created_at: u.createdAt,
      })
      .execute();
  }

  const productCount = products.length;
  const userCount = users.length;
  console.log(`Seeded ${productCount} products and ${userCount} users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => db.destroy());
