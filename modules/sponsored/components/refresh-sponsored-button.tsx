"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { revalidateSponsoredAction } from "@/app/actions/sponsored";

// Workshop step 07 — the "actualiser" button beside the sponsored title. It
// calls the server action that runs revalidateTag(SPONSORED_TAG), then refreshes
// the route so the now-stale fetch is re-run and fresh data streams back in.
export function RefreshSponsoredButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function refresh() {
    startTransition(async () => {
      await revalidateSponsoredAction();
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={refresh}
      disabled={isPending}
      title="Revalider le cache des produits sponsorisés (revalidateTag)"
      className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-xs font-medium text-muted transition hover:border-gold hover:text-ink disabled:opacity-50"
    >
      <span aria-hidden className={isPending ? "animate-spin" : ""}>
        ↻
      </span>
      {isPending ? "Actualisation…" : "Actualiser"}
    </button>
  );
}
