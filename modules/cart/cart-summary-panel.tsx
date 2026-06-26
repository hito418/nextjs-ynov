"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { formatPrice } from "@/modules/catalog/domain/product";
import type { CartLine } from "./types";

// Client shell for the (server-rendered) cart data. The data itself comes from
// the RSC <CartSummary/> as props — this component only owns UI state (the
// dropdown) and the "remove" mutation, which hits the DELETE API route and then
// asks the router to refresh so the RSC re-reads the DB.
export function CartSummaryPanel({
  lines,
  totalCount,
  totalCents,
  currency,
}: {
  lines: CartLine[];
  totalCount: number;
  totalCents: number;
  currency: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function remove(productId: string) {
    startTransition(async () => {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-gold"
      >
        <span aria-hidden>🛒</span>
        <span>Panier</span>
        <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-ink px-2 py-0.5 text-xs font-semibold text-cream">
          {totalCount}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-line bg-paper p-4 shadow-xl">
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">
              Votre panier est vide.
            </p>
          ) : (
            <>
              <ul
                className={
                  "max-h-72 space-y-3 overflow-auto transition-opacity " +
                  (isPending ? "opacity-50" : "")
                }
              >
                {lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-3">
                    <Image
                      src={line.image}
                      alt=""
                      width={48}
                      height={48}
                      className="rounded-lg border border-line"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{line.name}</p>
                      <p className="text-xs text-muted">
                        {line.quantity} ×{" "}
                        {formatPrice({
                          amountCents: line.priceCents,
                          currency: line.currency,
                        })}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.id)}
                      disabled={isPending}
                      className="text-xs text-muted underline-offset-2 hover:text-ink hover:underline disabled:opacity-50"
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-sm font-semibold">
                <span>Total</span>
                <span>{formatPrice({ amountCents: totalCents, currency })}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
