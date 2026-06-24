"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine, CartProductInput } from "./types";
import {
  addToCartAction,
  removeFromCartAction,
  mergeGuestCartAction,
} from "@/app/actions/cart";

export type { CartProductInput, CartLine } from "./types";

const STORAGE_KEY = "supastore_cart";

function loadLocal(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(lines: CartLine[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function clearLocal(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function upsert(
  lines: CartLine[],
  product: CartProductInput,
  quantity: number,
): CartLine[] {
  const existing = lines.find((line) => line.id === product.id);
  if (existing) {
    return lines.map((line) =>
      line.id === product.id
        ? { ...line, quantity: line.quantity + quantity }
        : line,
    );
  }
  return [...lines, { ...product, quantity }];
}

type CartContextValue = {
  lines: CartLine[];
  totalCount: number;
  totalCents: number;
  currency: string;
  addItem: (product: CartProductInput, quantity?: number) => void;
  removeLine: (id: string) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  userId,
  initialLines,
  children,
}: {
  /** null for guests; the user id when signed in (cart lives in the DB then). */
  userId: string | null;
  /** Server-rendered initial cart: the DB cart for users, [] for guests. */
  initialLines: CartLine[];
  children: React.ReactNode;
}) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const isUser = userId != null;

  // Hydrate on mount. Guests read localStorage; users merge any leftover guest
  // cart into their DB cart (e.g. items added before logging in), then drop it.
  useEffect(() => {
    if (!isUser) {
      // Must run after mount: reading localStorage during render would diverge
      // from the server's empty cart and trip a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLines(loadLocal());
      return;
    }
    const guest = loadLocal();
    if (guest.length > 0) {
      mergeGuestCartAction(
        guest.map((line) => ({ productId: line.id, quantity: line.quantity })),
      ).then((merged) => {
        if (merged) setLines(merged);
        clearLocal();
      });
    } else {
      clearLocal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const addItem = useCallback(
    (product: CartProductInput, quantity = 1) => {
      if (isUser) {
        setLines((cur) => upsert(cur, product, quantity)); // optimistic
        addToCartAction(product.id, quantity).then((res) => {
          if (res) setLines(res);
        });
      } else {
        setLines((cur) => {
          const next = upsert(cur, product, quantity);
          saveLocal(next);
          return next;
        });
      }
    },
    [isUser],
  );

  const removeLine = useCallback(
    (id: string) => {
      if (isUser) {
        setLines((cur) => cur.filter((line) => line.id !== id)); // optimistic
        removeFromCartAction(id).then((res) => {
          if (res) setLines(res);
        });
      } else {
        setLines((cur) => {
          const next = cur.filter((line) => line.id !== id);
          saveLocal(next);
          return next;
        });
      }
    },
    [isUser],
  );

  const value = useMemo<CartContextValue>(() => {
    const totalCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const totalCents = lines.reduce(
      (sum, line) => sum + line.priceCents * line.quantity,
      0,
    );
    return {
      lines,
      totalCount,
      totalCents,
      currency: lines[0]?.currency ?? "EUR",
      addItem,
      removeLine,
    };
  }, [lines, addItem, removeLine]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
