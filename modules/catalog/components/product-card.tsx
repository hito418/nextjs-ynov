import Link from "next/link";
import Image from "next/image";
import { formatPrice, type Product } from "../domain/product";
import { PrefetchLink } from "./prefetch-link";

const CARD_CLASS =
  "group flex flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm transition hover:-translate-y-1 hover:shadow-md";

// Server component: no interactivity of its own, just presentation. The outer
// link is either a plain <Link> (A/B variant "A" → default prefetching) or a
// <PrefetchLink> (variant "B" → hover-only prefetch). The variant is decided by
// the parent (which reads the `ab_prefetch` cookie) and passed in, so this stays
// a Server Component either way.
export function ProductCard({
  product,
  prefetchOnHover = false,
}: {
  product: Product;
  prefetchOnHover?: boolean;
}) {
  const href = `/products/${product.slug}`;
  const content = (
    <>
      <div className="relative aspect-square overflow-hidden bg-cream">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
          className="object-cover transition duration-300 group-hover:scale-105"
        />
        {product.featured && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-medium text-cream backdrop-blur">
            <span aria-hidden>★</span> Coup de cœur
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs uppercase tracking-wide text-muted">
          {product.category}
        </span>
        <h3 className="font-medium leading-snug text-ink">{product.name}</h3>
        <p className="mt-auto pt-2 font-semibold text-gold-dark">
          {formatPrice(product.price)}
        </p>
      </div>
    </>
  );

  if (prefetchOnHover) {
    return (
      <PrefetchLink href={href} className={CARD_CLASS}>
        {content}
      </PrefetchLink>
    );
  }

  return (
    <Link href={href} className={CARD_CLASS}>
      {content}
    </Link>
  );
}
