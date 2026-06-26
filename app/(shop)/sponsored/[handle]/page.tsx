import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSponsoredProductByHandle } from "@/modules/sponsored/api";
import { formatPrice } from "@/modules/catalog/domain/product";

// Workshop step 06 — the special page for a sponsored product. Same look as a
// catalog product page but intentionally WITHOUT an add-to-cart button: these
// products come from the external GraphQL store and aren't part of our cart.
export async function generateMetadata(
  props: PageProps<"/sponsored/[handle]">,
): Promise<Metadata> {
  const { handle } = await props.params;
  const product = await getSponsoredProductByHandle(handle);
  if (!product) return {};
  return { title: product.title, description: product.description };
}

export default async function SponsoredProductPage(
  props: PageProps<"/sponsored/[handle]">,
) {
  const { handle } = await props.params;
  const product = await getSponsoredProductByHandle(handle);
  if (!product) {
    notFound();
  }

  return (
    <article className="flex flex-col gap-8">
      <Link href="/" className="text-sm text-muted transition hover:text-ink">
        ← Retour à la boutique
      </Link>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-gold/60 bg-paper">
          {product.image && (
            <Image
              src={product.image}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 480px"
              className="object-cover"
            />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold-dark/90 px-2.5 py-1 text-xs font-medium text-cream">
            <span aria-hidden>✦</span> Produit sponsorisé
          </span>
          <h1 className="text-3xl font-semibold text-ink">{product.title}</h1>
          <p className="text-2xl font-semibold text-gold-dark">
            {formatPrice(product.price)}
          </p>
          <p className="leading-relaxed text-ink/80">{product.description}</p>
          <p className="text-sm text-muted">
            Ce produit sponsorisé provient d&apos;un partenaire externe et n&apos;est
            pas disponible à l&apos;achat sur My Supa Store.
          </p>
        </div>
      </div>
    </article>
  );
}
