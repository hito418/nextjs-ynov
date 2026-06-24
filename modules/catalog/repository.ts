import "server-only";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import type { Product } from "./domain/product";

// Raw row shapes returned by Kysely.
type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image: string;
  category: string;
  featured: number;
};

type SpecRow = {
  label: string;
  value: string;
  product_id: string;
};

function toDomain(row: ProductRow, specs: SpecRow[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    price: { amountCents: row.price_cents, currency: row.currency },
    image: row.image,
    category: row.category,
    featured: row.featured === 1,
    specs: specs.map((s) => ({ label: s.label, value: s.value })),
  };
}

/** Load specs for a set of products in one query, grouped by product id. */
async function specsByProduct(
  productIds: string[],
): Promise<Map<string, SpecRow[]>> {
  const grouped = new Map<string, SpecRow[]>();
  if (productIds.length === 0) return grouped;

  const rows = await db
    .selectFrom("specifications")
    .select(["label", "value", "product_id"])
    .where("product_id", "in", productIds)
    .orderBy("position", "asc")
    .execute();

  for (const row of rows) {
    const list = grouped.get(row.product_id) ?? [];
    list.push(row);
    grouped.set(row.product_id, list);
  }
  return grouped;
}

export async function getAllProducts(): Promise<Product[]> {
  const products = await db
    .selectFrom("products")
    .selectAll()
    .orderBy("name", "asc")
    .execute();

  const specs = await specsByProduct(products.map((p) => p.id));
  return products.map((p) => toDomain(p, specs.get(p.id) ?? []));
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const products = await db
    .selectFrom("products")
    .selectAll()
    .where("featured", "=", 1)
    .orderBy("name", "asc")
    .execute();

  const specs = await specsByProduct(products.map((p) => p.id));
  return products.map((p) => toDomain(p, specs.get(p.id) ?? []));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const product = await db
    .selectFrom("products")
    .selectAll()
    .where("slug", "=", slug)
    .executeTakeFirst();

  if (!product) return null;

  const specs = await specsByProduct([product.id]);
  return toDomain(product, specs.get(product.id) ?? []);
}

export async function getProductById(id: string): Promise<Product | null> {
  const product = await db
    .selectFrom("products")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();

  if (!product) return null;

  const specs = await specsByProduct([product.id]);
  return toDomain(product, specs.get(product.id) ?? []);
}

/** True if another product (not `exceptId`) already uses this slug. */
export async function slugExists(
  slug: string,
  exceptId: string,
): Promise<boolean> {
  const row = await db
    .selectFrom("products")
    .select("id")
    .where("slug", "=", slug)
    .where("id", "!=", exceptId)
    .executeTakeFirst();
  return row != null;
}

export type ProductUpdate = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  image: string;
  category: string;
  featured: boolean;
  specs: { label: string; value: string }[];
};

/**
 * Update a product and replace its specifications atomically. Specs are small
 * and fully owned by the product, so we delete + reinsert rather than diff them.
 */
export async function updateProductWithSpecs(
  input: ProductUpdate,
): Promise<void> {
  await db.transaction().execute(async (trx) => {
    await trx
      .updateTable("products")
      .set({
        name: input.name,
        slug: input.slug,
        description: input.description,
        price_cents: input.priceCents,
        currency: input.currency,
        image: input.image,
        category: input.category,
        featured: input.featured ? 1 : 0,
      })
      .where("id", "=", input.id)
      .execute();

    await trx
      .deleteFrom("specifications")
      .where("product_id", "=", input.id)
      .execute();

    if (input.specs.length > 0) {
      await trx
        .insertInto("specifications")
        .values(
          input.specs.map((s, position) => ({
            id: randomUUID(),
            label: s.label,
            value: s.value,
            position,
            product_id: input.id,
          })),
        )
        .execute();
    }
  });
}
