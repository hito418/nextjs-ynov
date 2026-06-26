import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { SPONSORED_TAG } from "@/modules/sponsored/api";

// Workshop step 07 — webhook-style on-demand revalidation (the Route Handler
// variant from the docs). Useful when an external system signals that the
// sponsored data changed. The in-app equivalent is the "Actualiser" button,
// which calls the same revalidateTag via a Server Action.
export async function GET() {
  revalidateTag(SPONSORED_TAG, "max");
  return NextResponse.json({ revalidated: true, tag: SPONSORED_TAG });
}
