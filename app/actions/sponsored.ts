"use server";

import { revalidateTag, revalidatePath } from "next/cache";
import { SPONSORED_TAG } from "@/modules/sponsored/api";

// Workshop step 07 — on-demand revalidation of the sponsored-products cache.
//
// revalidateTag marks every fetch tagged with SPONSORED_TAG as stale (the
// sponsored fetch sets `next: { tags: [SPONSORED_TAG] }`). With profile "max"
// it's stale-while-revalidate: the next visit serves stale data and refetches
// in the background. This invalidates the data wherever it's used — home AND
// product pages — in one call, which is why it's preferred over revalidatePath.
export async function revalidateSponsoredAction() {
  revalidateTag(SPONSORED_TAG, "max");
}

// Alternative shown for comparison: revalidatePath invalidates a whole route
// rather than a piece of tagged data. It would only refresh the given path
// (e.g. the home page), leaving the same data stale on the product pages.
export async function revalidateHomeAction() {
  revalidatePath("/");
}
