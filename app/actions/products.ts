"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/modules/account/auth";
import { isStaff } from "@/modules/account/domain/user";
import {
  slugExists,
  updateProductWithSpecs,
} from "@/modules/catalog/repository";

export type ProductFormState = { error?: string; ok?: boolean };

// Staff-only Server Action to update a product + its specs. Reachable via direct
// POST, so it re-checks auth and re-validates everything server-side.
export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const user = await getCurrentUser();
  if (!user || !isStaff(user.role)) {
    return { error: "Action réservée à l'administration." };
  }

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const slug = String(formData.get("slug") ?? "")
    .trim()
    .toLowerCase();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const image = String(formData.get("image") ?? "").trim();
  const currency = String(formData.get("currency") ?? "EUR").trim() || "EUR";
  const featured = formData.get("featured") === "on";
  const priceEuros = Number(String(formData.get("price") ?? "").replace(",", "."));

  if (!id) return { error: "Produit introuvable." };
  if (!name || !slug || !description || !category || !image) {
    return { error: "Tous les champs sont requis." };
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      error: "Le slug ne peut contenir que minuscules, chiffres et tirets.",
    };
  }
  if (!Number.isFinite(priceEuros) || priceEuros < 0) {
    return { error: "Prix invalide." };
  }
  if (await slugExists(slug, id)) {
    return { error: "Ce slug est déjà utilisé par un autre produit." };
  }

  // Spec rows arrive as parallel arrays; zip them and drop empty rows.
  const labels = formData.getAll("specLabel").map((v) => String(v).trim());
  const values = formData.getAll("specValue").map((v) => String(v).trim());
  const specs = labels
    .map((label, i) => ({ label, value: values[i] ?? "" }))
    .filter((s) => s.label && s.value);

  await updateProductWithSpecs({
    id,
    name,
    slug,
    description,
    priceCents: Math.round(priceEuros * 100),
    currency,
    image,
    category,
    featured,
    specs,
  });

  // Pages are dynamic, but revalidate anyway so any cached entry is refreshed.
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);

  return { ok: true };
}
