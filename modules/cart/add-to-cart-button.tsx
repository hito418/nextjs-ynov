"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CartProductInput } from "./types";

// Workshop step 04 — adding to the cart is now a POST to the /api/cart route
// (no Server Action, no client context). After a successful add we call
// router.refresh() so the server-rendered <CartSummary/> re-reads the DB and
// the header count updates — the "event client pour maj ajout".
export function AddToCartButton({ product }: { product: CartProductInput }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<"idle" | "added" | "login">("idle");

  function handleClick() {
    startTransition(async () => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (res.status === 401) {
        setState("login");
        router.push("/login");
        return;
      }

      setState("added");
      router.refresh();
      window.setTimeout(() => setState("idle"), 1500);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-7 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark disabled:opacity-60"
    >
      {state === "added"
        ? "Ajouté ✓"
        : state === "login"
          ? "Connexion requise"
          : isPending
            ? "Ajout…"
            : "Ajouter au panier"}
    </button>
  );
}
