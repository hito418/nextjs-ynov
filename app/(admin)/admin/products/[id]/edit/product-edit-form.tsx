"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  updateProductAction,
  type ProductFormState,
} from "@/app/actions/products";
import type { Product } from "@/modules/catalog/domain/product";

const initialState: ProductFormState = {};

const inputClass =
  "rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500";
const labelClass = "flex flex-col gap-1 text-sm font-medium text-slate-700";

export function ProductEditForm({ product }: { product: Product }) {
  const [state, action, pending] = useActionState(
    updateProductAction,
    initialState,
  );

  // Spec rows are controlled so add/remove behaves correctly. They submit as
  // parallel `specLabel` / `specValue` arrays the action zips back together.
  const [specs, setSpecs] = useState(
    product.specs.length > 0 ? product.specs : [{ label: "", value: "" }],
  );

  function updateSpec(index: number, key: "label" | "value", value: string) {
    setSpecs((rows) =>
      rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
    );
  }

  return (
    <form action={action} className="flex max-w-2xl flex-col gap-5">
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="currency" value={product.price.currency} />

      {state.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Produit enregistré.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Nom
          <input name="name" defaultValue={product.name} className={inputClass} />
        </label>
        <label className={labelClass}>
          Slug
          <input name="slug" defaultValue={product.slug} className={inputClass} />
        </label>
        <label className={labelClass}>
          Catégorie
          <input
            name="category"
            defaultValue={product.category}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Prix ({product.price.currency})
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={(product.price.amountCents / 100).toFixed(2)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Image (chemin)
          <input
            name="image"
            defaultValue={product.image}
            className={inputClass}
          />
        </label>
        <label className="flex items-center gap-2 self-end text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="featured"
            defaultChecked={product.featured}
            className="h-4 w-4"
          />
          Coup de cœur (mis en avant)
        </label>
      </div>

      <label className={labelClass}>
        Description
        <textarea
          name="description"
          defaultValue={product.description}
          rows={4}
          className={inputClass}
        />
      </label>

      <fieldset className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
        <legend className="px-1 text-sm font-semibold text-slate-700">
          Spécifications
        </legend>
        {specs.map((spec, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              name="specLabel"
              value={spec.label}
              onChange={(e) => updateSpec(i, "label", e.target.value)}
              placeholder="Libellé"
              className={`${inputClass} w-1/3`}
            />
            <input
              name="specValue"
              value={spec.value}
              onChange={(e) => updateSpec(i, "value", e.target.value)}
              placeholder="Valeur"
              className={`${inputClass} flex-1`}
            />
            <button
              type="button"
              onClick={() => setSpecs((rows) => rows.filter((_, idx) => idx !== i))}
              className="rounded-md px-2 py-1 text-sm text-slate-400 hover:text-red-600"
              aria-label="Supprimer la spécification"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setSpecs((rows) => [...rows, { label: "", value: "" }])}
          className="self-start rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          + Ajouter une spécification
        </button>
      </fieldset>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {/* Step 05 — submits the same form with __test_error set, so the action
            returns an error we can display without touching real data. */}
        <button
          type="submit"
          name="__test_error"
          value="1"
          disabled={pending}
          className="rounded-md border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
        >
          Tester une erreur
        </button>
        <Link
          href="/admin/products"
          className="text-sm text-slate-500 hover:text-slate-800"
        >
          Retour à la liste
        </Link>
      </div>
    </form>
  );
}
