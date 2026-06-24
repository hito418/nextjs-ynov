import {
  getAllProducts,
  getFeaturedProducts,
} from "@/modules/catalog/repository";
import { ProductCard } from "@/modules/catalog/components/product-card";

// Home page. An async Server Component that reads products straight from the
// database via the repository (workshop step 04: "brancher les produits dans
// les pages front, toujours en RSC"). No client JS is shipped for these lists.
export default async function HomePage() {
  // Two independent reads — run them concurrently.
  const [featured, products] = await Promise.all([
    getFeaturedProducts(),
    getAllProducts(),
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
      </section>

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
