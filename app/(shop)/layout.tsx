import Link from "next/link";
import { CartProvider } from "@/modules/cart/cart-context";
import { CartSummary } from "@/modules/cart/cart-summary";
import { getCurrentUser } from "@/modules/account/auth";
import { isStaff } from "@/modules/account/domain/user";
import { getCart } from "@/modules/cart/repository";
import { signOutAction } from "@/app/actions/auth";

// Front-office layout (route group "(shop)"). The parenthesised folder name is
// stripped from the URL: this layout wraps "/", "/products/[slug]" and "/test"
// without adding a path segment. The admin section gets a different chrome.
export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  // For signed-in users we seed the cart from the DB; guests start empty and the
  // client hydrates from localStorage.
  const initialLines = user ? await getCart(user.id) : [];
  const firstName = user?.name.split(" ")[0];

  return (
    <CartProvider userId={user?.id ?? null} initialLines={initialLines}>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-10 border-b border-line bg-cream/80 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="font-script text-3xl leading-none text-ink">
              My Supa Store
            </Link>
            <nav className="flex items-center gap-5 text-sm">
              <Link href="/" className="text-ink/80 transition hover:text-ink">
                Boutique
              </Link>

              {user && isStaff(user.role) && (
                <Link
                  href="/admin/products"
                  className="text-muted transition hover:text-ink"
                >
                  Admin
                </Link>
              )}

              {user ? (
                <span className="flex items-center gap-3">
                  <span className="text-ink/80">Bonjour {firstName}</span>
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="text-muted underline-offset-2 transition hover:text-ink hover:underline"
                    >
                      Déconnexion
                    </button>
                  </form>
                </span>
              ) : (
                <Link
                  href="/login"
                  className="text-ink/80 transition hover:text-ink"
                >
                  Se connecter
                </Link>
              )}

              <CartSummary />
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
          {children}
        </main>

        <footer className="border-t border-line bg-paper">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted sm:flex-row">
            <p>
              <span className="font-script text-lg text-ink">My Supa Store</span>{" "}
              — atelier Next.js
            </p>
            <p>© {new Date().getFullYear()} · Que du mock, pas de vraie commande</p>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
