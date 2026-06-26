import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllProducts,
  getProductBySlug,
} from "@/modules/catalog/repository";
import { formatPrice } from "@/modules/catalog/domain/product";
import { ProductInfo } from "@/modules/catalog/components/product-info";
import { AddToCartButton } from "@/modules/cart/add-to-cart-button";

// Skeleton sized to match the content so streaming doesn't shift layout (CLS).
function ProductInfoSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-12 border-b border-line" />
      <div className="mt-5 space-y-2">
        <div className="h-4 w-full rounded bg-line" />
        <div className="h-4 w-5/6 rounded bg-line" />
        <div className="h-4 w-2/3 rounded bg-line" />
      </div>
    </div>
  );
}

// Parallel Routes + Partial Prerendering. This page is the `children` slot of
// the product layout; the similar-products and sponsored-products sections live
// in the @similar and @sponsored slots (each with its own loading state).
//
// With `cacheComponents: true`, this slot is the STATIC SHELL — the hero and
// product info read the product via a synchronous better-sqlite3 query with no
// `connection()`, so they prerender at build time. The two parallel slots are
// the DYNAMIC HOLES, streamed in per request behind their loading.tsx.
//
// generateStaticParams must return at least one param when Cache Components is
// enabled — it does (one per product).
export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata(
  props: PageProps<"/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return { title: product.name, description: product.description };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;

  // Synchronous DB read, no connection() → resolves during prerender, so the
  // hero/product info below are part of the static shell.
  const product = await getProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-8">
      <Link href="/" className="text-sm text-muted transition hover:text-ink">
        ← Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-paper">
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 480px"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-4">
          <span className="text-xs uppercase tracking-wide text-muted">
            {product.category}
          </span>
          <h1 className="text-3xl font-semibold text-ink">{product.name}</h1>
          <p className="text-2xl font-semibold text-gold-dark">
            {formatPrice(product.price)}
          </p>
          <p className="leading-relaxed text-ink/80">{product.description}</p>
          <div className="pt-2">
            <AddToCartButton
              product={{
                id: product.id,
                slug: product.slug,
                name: product.name,
                priceCents: product.price.amountCents,
                currency: product.price.currency,
                image: product.image,
              }}
            />
          </div>
        </div>
      </div>

      {/* Part of the static shell. ProductTabs (inside) uses useSearchParams,
          which needs its own Suspense boundary — handled in ProductInfo. The
          similar & sponsored sections are no longer here: they're the @similar
          and @sponsored parallel-route slots rendered by the product layout. */}
      <Suspense fallback={<ProductInfoSkeleton />}>
        <ProductInfo product={product} />
      </Suspense>
    </article>
  );
}
