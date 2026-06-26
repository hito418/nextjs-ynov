import { Suspense } from "react";
import type { Product } from "../domain/product";
import { ProductTabs } from "./product-tabs";
import { simulateLatency, delayFromEnv } from "@/lib/workshop";

// Workshop step 05 — "le reste du produit". A deliberately slow Server
// Component (simulated latency) so the outer Suspense boundary in the product
// page has something to stream. It renders the description/specs tabs; the
// inner <ProductTabs/> keeps its own Suspense because it reads useSearchParams.
export async function ProductInfo({ product }: { product: Product }) {
  await simulateLatency(delayFromEnv("PRODUCT_DELAY_MS"));

  return (
    <Suspense
      fallback={<div className="h-12 border-b border-line" aria-hidden />}
    >
      <ProductTabs product={product} />
    </Suspense>
  );
}
