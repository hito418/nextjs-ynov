import "server-only";
import type { SponsoredProduct } from "./types";

// Workshop step 06 — consume the external GraphQL store (Shopify-Storefront
// style) for "sponsored products". The mock.shop endpoint from the brief is
// gone, replaced by graphqlstore.julienfroidefond.com. Its GraphiQL console
// hands out the example queries used below.
const ENDPOINT =
  "https://graphqlstore.julienfroidefond.com/api/2024-01/graphql.json";

/** Tag used for on-demand cache invalidation in step 07 (revalidateTag). */
export const SPONSORED_TAG = "sponsored-products";

type GqlImage = { url: string } | null;
type GqlPrice = { minVariantPrice: { amount: string; currencyCode: string } };
type GqlProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: GqlImage;
  priceRange: GqlPrice;
};

function toDomain(node: GqlProduct): SponsoredProduct {
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: node.description,
    image: node.featuredImage?.url ?? null,
    price: {
      amountCents: Math.round(
        Number(node.priceRange.minVariantPrice.amount) * 100,
      ),
      currency: node.priceRange.minVariantPrice.currencyCode,
    },
  };
}

/**
 * Low-level GraphQL fetcher. The cache behaviour is passed in by callers so
 * step 07 can compare "force-cache" / "no-store" / { next: { revalidate } }.
 * The timing log (the workshop's tip) shows, in dev, whether a request hit the
 * network or was served from the Data Cache.
 */
async function shopFetch<T>(
  query: string,
  variables: Record<string, unknown>,
  init: RequestInit & { next?: { revalidate?: number; tags?: string[] } } = {},
): Promise<T> {
  const start = performance.now();
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query, variables }),
    ...init,
  });
  console.log(
    `[mockShop] fetch ${(performance.now() - start).toFixed(0)}ms ` +
      `(cache=${init.cache ?? "default"}, revalidate=${init.next?.revalidate ?? "-"})`,
  );

  if (!res.ok) {
    throw new Error(`GraphQL request failed: ${res.status}`);
  }
  const json = (await res.json()) as { data: T; errors?: unknown };
  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }
  return json.data;
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      nodes {
        id title handle description
        featuredImage { url }
        priceRange { minVariantPrice { amount currencyCode } }
      }
    }
  }
`;

const PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      id title handle description
      featuredImage { url }
      priceRange { minVariantPrice { amount currencyCode } }
    }
  }
`;

export async function getSponsoredProducts(
  first = 4,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<SponsoredProduct[]> {
  const data = await shopFetch<{ products: { nodes: GqlProduct[] } }>(
    PRODUCTS_QUERY,
    { first },
    init ?? { cache: "no-store", next: { tags: [SPONSORED_TAG] } },
  );
  return data.products.nodes.map(toDomain);
}

export async function getSponsoredProductByHandle(
  handle: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } },
): Promise<SponsoredProduct | null> {
  const data = await shopFetch<{ productByHandle: GqlProduct | null }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
    init ?? { cache: "no-store", next: { tags: [SPONSORED_TAG] } },
  );
  return data.productByHandle ? toDomain(data.productByHandle) : null;
}
