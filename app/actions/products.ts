"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/modules/account/auth";
import { isStaff } from "@/modules/account/domain/user";
import {
  slugExists,
  updateProductWithSpecs,
} from "@/modules/catalog/repository";

export type ProductFormState = { error?: string; ok?: boolean };

// Step 03 — input is validated with zod instead of hand-rolled `if`s. The schema
// both *parses* (coerces price, trims strings, lower-cases the slug) and
// *validates*, returning typed data on success. FormData values are strings, so
// we shape a plain object first, then hand it to the schema.
const productSchema = z.object({
  id: z.string().min(1, "Produit introuvable."),
  name: z.string().trim().min(1, "Tous les champs sont requis."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Tous les champs sont requis.")
    .regex(
      /^[a-z0-9-]+$/,
      "Le slug ne peut contenir que minuscules, chiffres et tirets.",
    ),
  description: z.string().trim().min(1, "Tous les champs sont requis."),
  category: z.string().trim().min(1, "Tous les champs sont requis."),
  image: z.string().trim().min(1, "Tous les champs sont requis."),
  currency: z.string().trim().min(1).default("EUR"),
  featured: z.boolean(),
  price: z
    .number()
    .refine((n) => Number.isFinite(n) && n >= 0, "Prix invalide."),
});

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

  // Step 05 — a deliberate failure path so we can exercise the error UI without
  // corrupting real data. The "Tester une erreur" button submits this field.
  if (formData.get("__test_error")) {
    return { error: "Erreur de test : la sauvegarde a échoué (simulation)." };
  }

  const parsed = productSchema.safeParse({
    id: String(formData.get("id") ?? ""),
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    image: String(formData.get("image") ?? ""),
    currency: String(formData.get("currency") ?? "EUR") || "EUR",
    featured: formData.get("featured") === "on",
    price: Number(String(formData.get("price") ?? "").replace(",", ".")),
  });

  if (!parsed.success) {
    // Surface the first validation message — good enough for this single-field
    // error banner.
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const data = parsed.data;

  if (await slugExists(data.slug, data.id)) {
    return { error: "Ce slug est déjà utilisé par un autre produit." };
  }

  // Spec rows arrive as parallel arrays; zip them and drop empty rows.
  const labels = formData.getAll("specLabel").map((v) => String(v).trim());
  const values = formData.getAll("specValue").map((v) => String(v).trim());
  const specs = labels
    .map((label, i) => ({ label, value: values[i] ?? "" }))
    .filter((s) => s.label && s.value);

  // Step 05 — if the write itself blows up (constraint, disk, …), don't crash
  // the action: turn it into a friendly error the form can display.
  try {
    await updateProductWithSpecs({
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      priceCents: Math.round(data.price * 100),
      currency: data.currency,
      image: data.image,
      category: data.category,
      featured: data.featured,
      specs,
    });
  } catch (err) {
    console.error("[updateProductAction] update failed:", err);
    return { error: "Échec de l'enregistrement. Réessayez." };
  }

  // Step 04 — products are now cached (unstable_cache, tag "products"). Drop that
  // cache so the storefront reflects the edit. In Next 16 revalidateTag takes a
  // second argument; `{ expire: 0 }` expires the tag immediately so the next
  // request is a fresh miss (crisp to observe in the workshop). catalog-stats
  // derives from the same data, so refresh it too; revalidatePath covers the
  // admin views.
  revalidateTag("products", { expire: 0 });
  revalidateTag("catalog-stats", { expire: 0 });
  revalidatePath("/admin/products");
  revalidatePath(`/products/${data.slug}`);

  return { ok: true };
}
