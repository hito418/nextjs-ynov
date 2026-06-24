"use server";

import { getCurrentUser } from "@/modules/account/auth";
import {
  getCart,
  addItem,
  removeItem,
  mergeItems,
} from "@/modules/cart/repository";
import type { CartLine } from "@/modules/cart/types";

// All cart Server Actions resolve the user themselves (they're reachable via
// direct POST). Guests never call these — they persist to localStorage on the
// client. A null return means "not signed in", which the client treats as a no-op.

export async function addToCartAction(
  productId: string,
  quantity = 1,
): Promise<CartLine[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  await addItem(user.id, productId, quantity);
  return getCart(user.id);
}

export async function removeFromCartAction(
  productId: string,
): Promise<CartLine[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  await removeItem(user.id, productId);
  return getCart(user.id);
}

export async function mergeGuestCartAction(
  items: { productId: string; quantity: number }[],
): Promise<CartLine[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  await mergeItems(user.id, items);
  return getCart(user.id);
}
