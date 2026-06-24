// Kysely database interface. These types describe the *raw* SQLite columns
// (snake_case, integer booleans) that the Drizzle migrations create. Keep them
// in sync with db/schema.ts — Kysely queries are typed against this shape.

export interface ProductsTable {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image: string;
  category: string;
  /** SQLite boolean stored as 0 | 1 */
  featured: number;
}

export interface SpecificationsTable {
  id: string;
  label: string;
  value: string;
  position: number;
  product_id: string;
}

export interface UsersTable {
  id: string;
  email: string;
  name: string;
  role: string;
  password_hash: string | null;
  created_at: string;
}

export interface SessionsTable {
  id: string;
  user_id: string;
  expires_at: string;
}

export interface CartItemsTable {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
}

export interface Database {
  products: ProductsTable;
  specifications: SpecificationsTable;
  users: UsersTable;
  sessions: SessionsTable;
  cart_items: CartItemsTable;
}
