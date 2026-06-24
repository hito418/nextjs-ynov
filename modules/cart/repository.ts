import "server-only";
import { randomUUID } from "node:crypto";
import { sql } from "kysely";
import { db } from "@/lib/db";
import type { CartLine } from "./types";

// Persistent cart for a logged-in user. Lines are always returned joined with
// product data so the UI has everything it needs to render.

export async function getCart(userId: string): Promise<CartLine[]> {
  const rows = await db
    .selectFrom("cart_items")
    .innerJoin("products", "products.id", "cart_items.product_id")
    .select([
      "products.id as id",
      "products.slug as slug",
      "products.name as name",
      "products.price_cents as priceCents",
      "products.currency as currency",
      "products.image as image",
      "cart_items.quantity as quantity",
    ])
    .where("cart_items.user_id", "=", userId)
    .orderBy("products.name", "asc")
    .execute();

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    priceCents: r.priceCents,
    currency: r.currency,
    image: r.image,
    quantity: r.quantity,
  }));
}

export async function addItem(
  userId: string,
  productId: string,
  quantity = 1,
): Promise<void> {
  await db
    .insertInto("cart_items")
    .values({ id: randomUUID(), user_id: userId, product_id: productId, quantity })
    .onConflict((oc) =>
      oc
        .columns(["user_id", "product_id"])
        .doUpdateSet({
          quantity: sql`cart_items.quantity + ${quantity}`,
        }),
    )
    .execute();
}

export async function removeItem(
  userId: string,
  productId: string,
): Promise<void> {
  await db
    .deleteFrom("cart_items")
    .where("user_id", "=", userId)
    .where("product_id", "=", productId)
    .execute();
}

/** Merge a guest cart (from localStorage) into the user's saved cart. */
export async function mergeItems(
  userId: string,
  items: { productId: string; quantity: number }[],
): Promise<void> {
  for (const item of items) {
    if (item.quantity > 0) {
      await addItem(userId, item.productId, item.quantity);
    }
  }
}
