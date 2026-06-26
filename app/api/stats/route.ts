import { NextResponse } from "next/server";
import { connection } from "next/server";
import {
  getCatalogStats,
  getCatalogStatsUncached,
} from "@/lib/catalog-stats";

// Workshop step 10 — compare the expensive computation with and without
// unstable_cache. Hit this route twice:
//   1st call: cached path is a MISS (~same cost as uncached).
//   2nd call onward: cached path is a HIT (~0ms), uncached path stays slow.
export async function GET() {
  // Run per request (not prerendered) so the cached/uncached comparison is live.
  await connection();

  const t0 = performance.now();
  await getCatalogStatsUncached();
  const uncachedMs = +(performance.now() - t0).toFixed(1);

  const t1 = performance.now();
  const stats = await getCatalogStats();
  const cachedMs = +(performance.now() - t1).toFixed(1);

  return NextResponse.json({
    uncachedMs,
    cachedMs,
    speedup: uncachedMs > 0 ? +(uncachedMs / Math.max(cachedMs, 0.1)).toFixed(1) : null,
    stats,
  });
}
