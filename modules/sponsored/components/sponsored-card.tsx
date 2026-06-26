import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/modules/catalog/domain/product";
import { PrefetchLink } from "@/modules/catalog/components/prefetch-link";
import type { SponsoredProduct } from "../types";

const CARD_CLASS =
  "group flex flex-col overflow-hidden rounded-2xl border border-gold/60 bg-paper shadow-sm transition hover:-translate-y-1 hover:shadow-md";

// A sponsored product card. Links to the special /sponsored/[handle] page and
// carries a "Sponsorisé" badge. Deliberately has NO add-to-cart button — these
// products are not part of our catalog/cart. Like ProductCard, the A/B "B"
// variant uses hover-only prefetch (see PrefetchLink).
export function SponsoredCard({
  product,
  prefetchOnHover = false,
}: {
  product: SponsoredProduct;
  prefetchOnHover?: boolean;
}) {
  const href = `/sponsored/${product.handle}`;
  const content = (
    <>
      <div className="relative aspect-square overflow-hidden bg-cream">
        {product.image && (
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        )}
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-gold-dark/90 px-2.5 py-1 text-xs font-medium text-cream backdrop-blur">
          <span aria-hidden>✦</span> Sponsorisé
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-medium leading-snug text-ink">{product.title}</h3>
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
