import Link from "next/link";
import type { Product } from "../domain/product";

export type ProductTab = "description" | "specifications";

const TABS: { key: ProductTab; label: string }[] = [
  { key: "description", label: "Description" },
  { key: "specifications", label: "Spécifications" },
];

// Tabs are plain links that set the `tab` search param. The page is a Server
// Component that reads `searchParams`, so switching tabs re-renders on the
// server with no client-side state (workshop step 08).
export function ProductTabs({
  product,
  active,
}: {
  product: Product;
  active: ProductTab;
}) {
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
