import { getProductBySlug } from "@/modules/catalog/repository";
import { SimilarProducts } from "@/modules/catalog/components/similar-products";

// @similar slot. Receives the same [slug] param as the segment. It resolves the
// product to learn its category, then renders the similar-products section.
// SimilarProducts calls `await connection()`, so this slot is a dynamic hole;
// its sibling loading.tsx is the independent loading state.
export default async function SimilarSlot({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return null;

  return <SimilarProducts slug={product.slug} category={product.category} />;
}
