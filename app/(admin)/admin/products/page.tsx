import Image from "next/image";
import Link from "next/link";
import { getAllProducts } from "@/modules/catalog/repository";
import { formatPrice } from "@/modules/catalog/domain/product";

// RSC that reads every product from the database (workshop step 04). Same
// repository as the storefront — the data layer is shared, the UI is not.
export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Produits</h2>
          <p className="text-sm text-slate-500">
            {products.length} produit(s) en base
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Produit</th>
              <th className="px-4 py-3 font-medium">Catégorie</th>
              <th className="px-4 py-3 font-medium">Prix</th>
              <th className="px-4 py-3 font-medium">En avant</th>
              <th className="px-4 py-3 font-medium">Specs</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Image
                      src={product.image}
                      alt=""
                      width={40}
                      height={40}
                      className="rounded-md border border-slate-200"
                    />
                    <div>
                      <Link
                        href={`/products/${product.slug}`}
                        className="font-medium text-slate-900 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-slate-400">/{product.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{product.category}</td>
                <td className="px-4 py-3 font-medium">
                  {formatPrice(product.price)}
                </td>
                <td className="px-4 py-3">
                  {product.featured ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      Oui
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {product.specs.length}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Éditer
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
