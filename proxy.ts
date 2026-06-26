import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRoleBySessionToken } from "@/modules/account/repository";
import { isStaff } from "@/modules/account/domain/user";

// Proxy (Next 16's renamed Middleware) — runs before the route renders, on the
// Node.js runtime. It does two jobs:
//
//   1. Auth gate for /admin — anyone without a staff role is bounced to the
//      storefront, so the back-office isn't even reachable by URL. This is
//      defence-in-depth: (admin)/layout.tsx still re-checks server-side.
//
//   2. A/B assignment (step 06) — on first visit we flip a coin and remember the
//      variant in the `ab_prefetch` cookie. `?ab_prefetch=A|B` forces a variant
//      (handy for testing). Step 07 reads this cookie to tune link prefetching.

const AB_COOKIE = "ab_prefetch";
const AB_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // --- 1. Auth gate (only for the back-office) ---
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const token = request.cookies.get("session")?.value;
    const role = token ? await getRoleBySessionToken(token) : null;

    if (!role || !isStaff(role)) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  // --- 2. A/B assignment ---
  const response = NextResponse.next();
  const forced = searchParams.get(AB_COOKIE);
  const existing = request.cookies.get(AB_COOKIE)?.value;

  if (forced === "A" || forced === "B") {
    // Explicit override via ?ab_prefetch=A|B always wins and is persisted.
    response.cookies.set(AB_COOKIE, forced, {
      path: "/",
      maxAge: AB_MAX_AGE,
      sameSite: "lax",
    });
  } else if (existing !== "A" && existing !== "B") {
    // No (valid) cookie yet → draw once, 50/50, and remember it.
    const variant = Math.random() < 0.5 ? "A" : "B";
    response.cookies.set(AB_COOKIE, variant, {
      path: "/",
      maxAge: AB_MAX_AGE,
      sameSite: "lax",
    });
  }
  // Otherwise the visitor keeps their existing variant — no Set-Cookie.

  return response;
}

export const config = {
  // Run on every navigable route (so the A/B coin flip happens site-wide), but
  // skip API routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg$|.*\\.ico$).*)",
  ],
};
