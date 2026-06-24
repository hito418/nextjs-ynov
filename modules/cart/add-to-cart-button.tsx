"use client";

import { useState } from "react";
import { useCart, type CartProductInput } from "./cart-context";

// Client island dropped into the (server-rendered) product page. It receives a
// plain serializable product object as props and mutates client-only cart state.
export function AddToCartButton({ product }: { product: CartProductInput }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleClick() {
    addItem(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
    >
      {added ? "Ajouté ✓" : "Ajouter au panier"}
    </button>
  );
}
