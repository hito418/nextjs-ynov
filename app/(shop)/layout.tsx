import { Suspense } from "react";
import Link from "next/link";
import { CartSummary } from "@/modules/cart/cart-summary";
import { AccountNav } from "@/modules/account/account-nav";
import { LocalizedNav } from "@/modules/i18n/localized-nav";
import { Footer } from "./footer";

// Front-office layout (route group "(shop)"). The parenthesised folder name is
// stripped from the URL.
//
// Step 09 (Cache Components / PPR): the layout body itself does no dynamic
// work, so the header chrome, the <main> wrapper and the (cached) <Footer/>
// form the static shell. The two per-user, cookie-reading components —
// <AccountNav/> and <CartSummary/> — are each wrapped in <Suspense> so they
// become streamed dynamic holes instead of forcing the whole shell dynamic.
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-cream/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="font-script text-3xl leading-none text-ink">
            My Supa Store
          </Link>
          <nav className="flex items-center gap-5 text-sm">
            {/* Step 07 — cookie-driven i18n: the shop link + language switch
                read NEXT_LOCALE, so they're a dynamic hole behind Suspense. */}
            <Suspense
              fallback={<span className="h-5 w-24 rounded bg-line" aria-hidden />}
            >
              <LocalizedNav />
            </Suspense>

            <Suspense
              fallback={<span className="h-5 w-20 rounded bg-line" aria-hidden />}
            >
              <AccountNav />
            </Suspense>

            <Suspense
              fallback={
                <span className="h-9 w-24 rounded-full bg-line" aria-hidden />
              }
            >
              <CartSummary />
            </Suspense>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>

      <Suspense
        fallback={<div className="h-24 border-t border-line bg-paper" />}
      >
        <Footer />
      </Suspense>
    </div>
  );
}
