import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/modules/catalog/domain/product";
import type { SponsoredProduct } from "../types";

// A sponsored product card. Links to the special /sponsored/[handle] page and
// carries a "Sponsorisé" badge. Deliberately has NO add-to-cart button — these
// products are not part of our catalog/cart.
export function SponsoredCard({ product }: { product: SponsoredProduct }) {
  return (
    <Link
      href={`/sponsored/${product.handle}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-gold/60 bg-paper shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
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
    </Link>
  );
}
