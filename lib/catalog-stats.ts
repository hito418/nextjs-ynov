import "server-only";
import { unstable_cache } from "next/cache";
import { getAllProducts } from "@/modules/catalog/repository";

// Workshop step 10 — unstable_cache around an expensive computation.
//
// In Next 16, `unstable_cache` is superseded by the `use cache` directive
// (which we used for the footer in step 09), but the brief names it explicitly,
// so we demonstrate it here. It memoises the result of a costly function across
// requests, keyed by the function + its arguments + the keyParts below.

export type CatalogStats = {
  count: number;
  totalCents: number;
  averageCents: number;
  priciestName: string;
  /** A meaningless "score" whose only job is to burn CPU. */
  score: number;
};

// Deliberately expensive: a heavy CPU loop on top of the DB read, so the
// cached vs uncached difference is measurable.
async function computeCatalogStats(): Promise<CatalogStats> {
  const start = performance.now();
  const products = await getAllProducts();

  let score = 0;
  for (let i = 0; i < 30_000_000; i++) {
    score = (score + Math.sqrt(i * (products.length + 1))) % 1_000_003;
  }

  const totalCents = products.reduce((sum, p) => sum + p.price.amountCents, 0);
  const priciest = products.reduce((max, p) =>
    p.price.amountCents > max.price.amountCents ? p : max,
  );

  console.log(
    `[stats] computeCatalogStats ${(performance.now() - start).toFixed(0)}ms (cache MISS)`,
  );

  return {
    count: products.length,
    totalCents,
    averageCents: Math.round(totalCents / products.length),
    priciestName: priciest.name,
    score: Math.round(score),
  };
}

// Cached version: the heavy compute runs once, then results are reused across
// requests until the tag is revalidated or `revalidate` seconds elapse.
export const getCatalogStats = unstable_cache(
  computeCatalogStats,
  ["catalog-stats"],
  { tags: ["catalog-stats"], revalidate: 3600 },
);

// Uncached version, exposed only so the demo route can compare the two.
export const getCatalogStatsUncached = computeCatalogStats;
