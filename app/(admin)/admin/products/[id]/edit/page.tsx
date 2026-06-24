import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductById } from "@/modules/catalog/repository";
import { ProductEditForm } from "./product-edit-form";

// Routed by product id (stable even if the slug changes on save).
export default async function EditProductPage(
  props: PageProps<"/admin/products/[id]/edit">,
) {
  const { id } = await props.params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/products"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          ← Produits
        </Link>
        <h2 className="mt-2 text-xl font-semibold">Éditer : {product.name}</h2>
      </div>
      <ProductEditForm product={product} />
    </div>
  );
}
