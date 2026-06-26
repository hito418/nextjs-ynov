"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "../domain/product";

export type ProductTab = "description" | "specifications";

const TABS: { key: ProductTab; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "specifications", label: "Spécifications" },
];

// Client component (workshop step 01). The active tab comes from the `?tab=`
// query string via `useSearchParams`. Reading the query string here — instead
// of `searchParams` in the page — is what lets the product page stay fully
// static: `searchParams` can never be statically prerendered, so we isolate
// that dynamic read in a client island wrapped in <Suspense> by the page.
export function ProductTabs({ product }: { product: Product }) {
  const searchParams = useSearchParams();
  const active: ProductTab =
    searchParams.get("tab") === "specifications"
      ? "specifications"
      : "description";

  return (
    <div>
      <div role="tablist" className="flex gap-1 border-b border-line">
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <Link
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              href={`/products/${product.slug}?tab=${tab.key}`}
              scroll={false}
              className={
                "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition " +
                (isActive
                  ? "border-gold-dark text-ink"
                  : "border-transparent text-muted hover:text-ink")
              }
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="py-5 text-ink/90" role="tabpanel">
        {active === "description" ? (
          <p className="leading-relaxed">{product.description}</p>
        ) : (
          <dl className="divide-y divide-line">
            {product.specs.map((spec) => (
              <div
                key={spec.label}
                className="flex justify-between gap-4 py-2.5 text-sm"
              >
                <dt className="text-muted">{spec.label}</dt>
                <dd className="text-right font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
