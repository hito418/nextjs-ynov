import { connection } from "next/server";
import { cookies } from "next/headers";
import { getSimilarProducts } from "../repository";
import { ProductCard } from "./product-card";
import { simulateLatency, delayFromEnv } from "@/lib/workshop";

// Workshop step 04 — "produits similaires". Async Server Component: other
// products in the same category. Step 05 added a simulated latency so it can
// be streamed behind a Suspense boundary.
//
// Step 09 (Cache Components): `getSimilarProducts` is a synchronous
// better-sqlite3 query, which would otherwise resolve during prerender and get
// baked into the static shell. `await connection()` ties this component to the
// incoming request, excluding it (and everything below) from the shell so it
// becomes a streamed dynamic hole — exactly what the brief means by
// "prisma aura besoin de await connection; seul fetch est auto déterminé".
export async function SimilarProducts({
  slug,
  category,
}: {
  slug: string;
  category: string;
}) {
  await connection();
  await simulateLatency(delayFromEnv("SIMILAR_DELAY_MS"));
  const products = await getSimilarProducts(slug, category);
  if (products.length === 0) return null;

  // Step 07 — variant "B" gets hover-only prefetch on these links instead of
  // the default viewport prefetch. This component is already a dynamic hole
  // (await connection() above), so reading the cookie costs nothing extra.
  const variant = (await cookies()).get("ab_prefetch")?.value;
  const prefetchOnHover = variant === "B";

  return (
    <section>
      <h2 className="mb-5 font-script text-3xl text-ink">Produits similaires</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            prefetchOnHover={prefetchOnHover}
          />
        ))}
      </div>
    </section>
  );
}
