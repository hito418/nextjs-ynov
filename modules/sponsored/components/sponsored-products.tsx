import { cookies } from "next/headers";
import { getSponsoredProducts } from "../api";
import { SponsoredCard } from "./sponsored-card";
import { RefreshSponsoredButton } from "./refresh-sponsored-button";

// Async Server Component that fetches sponsored products from the GraphQL store
// and renders them as a section. Used on the home page and on product detail
// pages. Step 07 adds a refresh button (revalidateTag) beside the title; step
// 08 moves this into a @sponsored parallel-route slot.
export async function SponsoredProducts({ limit = 4 }: { limit?: number }) {
  const products = await getSponsoredProducts(limit);
  if (products.length === 0) return null;

  // Step 07 — hover-only prefetch for variant "B". The uncached GraphQL fetch
  // already makes this a dynamic hole, so reading the cookie is free.
  const variant = (await cookies()).get("ab_prefetch")?.value;
  const prefetchOnHover = variant === "B";

  return (
    <section>
      <div className="mb-5 flex items-center gap-4">
        <h2 className="font-script text-3xl text-ink">Produits sponsorisés</h2>
        <RefreshSponsoredButton />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <SponsoredCard
            key={product.id}
            product={product}
            prefetchOnHover={prefetchOnHover}
          />
        ))}
      </div>
    </section>
  );
}
