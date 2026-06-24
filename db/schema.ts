import {
  sqliteTable,
  text,
  integer,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// Drizzle is used here purely as the *migration* source of truth (drizzle-kit
// generate/migrate). Runtime queries go through Kysely (see lib/db.ts), which
// reads the same SQLite database.

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  image: text("image").notNull(),
  category: text("category").notNull(),
  // SQLite has no boolean type — stored as integer 0/1.
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
});

export const specifications = sqliteTable(
  "specifications",
  {
    id: text("id").primaryKey(),
    label: text("label").notNull(),
    value: text("value").notNull(),
    position: integer("position").notNull().default(0),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
  },
  (table) => [index("specifications_product_id_idx").on(table.productId)],
);

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role").notNull().default("customer"),
  // scrypt hash ("salt:hash"); null for accounts that can't sign in (customers).
  passwordHash: text("password_hash"),
  // ISO-8601 string — kept as TEXT so it diffs/reads cleanly in SQLite.
  createdAt: text("created_at").notNull(),
});

export const sessions = sqliteTable(
  "sessions",
  {
    // Opaque random token; also the value stored in the cookie.
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: text("expires_at").notNull(),
  },
  (table) => [index("sessions_user_id_idx").on(table.userId)],
);

// A logged-in user's saved cart: one row per (user, product). The unique index
// lets us upsert quantities. Guests don't touch this table (they use localStorage).
export const cartItems = sqliteTable(
  "cart_items",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
  },
  (table) => [
    uniqueIndex("cart_items_user_product_idx").on(table.userId, table.productId),
  ],
);
