import { Suspense } from "react";
import {
  getAllProducts,
  getFeaturedProducts,
} from "@/modules/catalog/repository";
import { ProductCard } from "@/modules/catalog/components/product-card";
import { SponsoredProducts } from "@/modules/sponsored/components/sponsored-products";
import { formatPrice } from "@/modules/catalog/domain/product";
import { getCatalogStats } from "@/lib/catalog-stats";

// Home page. An async Server Component that reads products straight from the
// database via the repository (workshop step 04: "brancher les produits dans
// les pages front, toujours en RSC"). No client JS is shipped for these lists.
export default async function HomePage() {
  // Two independent reads — run them concurrently. `getCatalogStats` is the
  // expensive computation memoised with unstable_cache (step 10): the heavy
  // pass runs once, then this resolves instantly from cache and is prerendered
  // into the static shell.
  const [featured, products, stats] = await Promise.all([
    getFeaturedProducts(),
    getAllProducts(),
    getCatalogStats(),
  ]);

  return (
    <div className="flex flex-col gap-12">
      <section className="text-center">
        <h1 className="font-script text-5xl text-ink sm:text-6xl">
          Bienvenue chez My Supa Store
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Une sélection d&apos;épicerie fine et d&apos;objets pour la maison.
          Cliquez sur un produit pour découvrir sa fiche.
        </p>
        <p className="mx-auto mt-4 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-line bg-paper px-5 py-2 text-xs text-muted">
          <span>{stats.count} produits</span>
          <span aria-hidden>·</span>
          <span>
            panier moyen{" "}
            {formatPrice({ amountCents: stats.averageCents, currency: "EUR" })}
          </span>
          <span aria-hidden>·</span>
          <span>le + cher : {stats.priciestName}</span>
        </p>
      </section>

      <Suspense fallback={<SponsoredProductsFallback />}>
        <SponsoredProducts limit={4} />
      </Suspense>

      {featured.length > 0 && (
        <section>
          <h2 className="mb-5 font-script text-3xl text-ink">Coups de cœur</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
          Tous les produits ({products.length})
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SponsoredProductsFallback() {
  return (
    <section className="animate-pulse">
      <div className="mb-5 h-8 w-60 rounded bg-line" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-line bg-paper">
            <div className="aspect-square rounded-t-2xl bg-line" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-2/3 rounded bg-line" />
              <div className="h-4 w-1/3 rounded bg-line" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
