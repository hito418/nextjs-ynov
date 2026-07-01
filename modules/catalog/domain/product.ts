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
  /**
   * Units available. Optional because the current DB doesn't track it yet —
   * `undefined` means "stock not tracked", treated as available. Present as a
   * first-class domain concept so the purchasability rule (isInStock) is
   * testable and ready when inventory lands.
   */
  stock?: number;
};

/** Format a Money value for display, e.g. `12,90 €`. */
export function formatPrice(price: Money, locale = "fr-FR"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: price.currency,
  }).format(price.amountCents / 100);
}

/**
 * Business rule — is the product purchasable?
 * `undefined` stock = not tracked = available. A tracked stock is in stock only
 * when strictly positive (0 or negative → out of stock).
 */
export function isInStock(product: Pick<Product, "stock">): boolean {
  return product.stock === undefined || product.stock > 0;
}
