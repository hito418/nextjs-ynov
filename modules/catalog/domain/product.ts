// Catalog domain layer (DDD).
//
// These types describe the *domain* shape of a product — what the rest of the
// app consumes. They are intentionally decoupled from the Prisma persistence
// model: the repository maps database rows into these types, so UI code never
// imports Prisma directly.

export type Money = {
  amountCents: number;
  currency: string;
};

export type Specification = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: Money;
  image: string;
  category: string;
  featured: boolean;
  specs: Specification[];
};

/** Format a Money value for display, e.g. `12,90 €`. */
export function formatPrice(price: Money, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
  }).format(price.amountCents / 100);
}
