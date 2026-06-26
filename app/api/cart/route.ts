import { NextResponse } from "next/server";
import { getCurrentUser } from "@/modules/account/auth";
import { addItem, removeItem, getCart } from "@/modules/cart/repository";

// Workshop step 04 — cart mutations move from a Server Action behind a React
// context to a plain POST API route. The client `AddToCartButton` calls this,
// then refreshes the route so the RSC `CartSummary` re-reads the DB. The cart
// is per-user, so a session is required (guests are sent to /login by the UI).

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = body?.productId;
  const quantity = Number(body?.quantity ?? 1);

  if (typeof productId !== "string" || !Number.isFinite(quantity)) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  await addItem(user.id, productId, quantity);
  const cart = await getCart(user.id);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  return NextResponse.json({ count, cart });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const productId = body?.productId;
  if (typeof productId !== "string") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  await removeItem(user.id, productId);
  const cart = await getCart(user.id);
  const count = cart.reduce((sum, line) => sum + line.quantity, 0);
  return NextResponse.json({ count, cart });
}
