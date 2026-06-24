// Shared cart shapes — no "use client"/"server-only" directive, so both the
// client context and the server repository/actions can import them.

export type CartProductInput = {
  id: string;
  slug: string;
  name: string;
  priceCents: number;
  currency: string;
  image: string;
};

export type CartLine = CartProductInput & {
  quantity: number;
};
