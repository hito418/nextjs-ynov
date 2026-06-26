// Domain shape for a "sponsored product" sourced from the external GraphQL
// store (a Shopify-Storefront-style API). Decoupled from the raw GraphQL
// response, mirroring how the catalog module maps DB rows to a domain type.
import type { Money } from "@/modules/catalog/domain/product";

export type SponsoredProduct = {
  /** The Shopify gid, e.g. "gid://shopify/Product/2001". */
  id: string;
  /** URL-safe identifier used for the special sponsored page. */
  handle: string;
  title: string;
  description: string;
  image: string | null;
  price: Money;
};
