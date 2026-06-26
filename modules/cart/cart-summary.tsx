import { getCurrentUser } from "@/modules/account/auth";
import { getCart } from "./repository";
import { CartSummaryPanel } from "./cart-summary-panel";

// Workshop step 04 — the cart summary is now a Server Component. It reads the
// signed-in user's cart straight from the DB (no client context, no client
// fetch for the data) and hands plain serializable props to a small client
// panel for the dropdown UI. Reading the session cookie here makes the (shop)
// layout — and therefore the whole route — render dynamically; step 09 (PPR)
// is what lets this dynamic widget live inside an otherwise static shell.
export async function CartSummary() {
  const user = await getCurrentUser();
  const lines = user ? await getCart(user.id) : [];

  const totalCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  const totalCents = lines.reduce(
    (sum, line) => sum + line.priceCents * line.quantity,
    0,
  );

  return (
    <CartSummaryPanel
      lines={lines}
      totalCount={totalCount}
      totalCents={totalCents}
      currency={lines[0]?.currency ?? "EUR"}
    />
  );
}
