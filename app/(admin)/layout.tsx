import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/modules/account/auth";
import { roleLabel, isStaff } from "@/modules/account/domain/user";
import { signOutAction } from "@/app/actions/auth";

// Back-office layout (route group "(admin)"). It lives in a *different* route
// group than the storefront, so the admin gets its own chrome — dark sidebar,
// no cart, no script font — while sharing the same root layout / URL space.
//
// It also acts as the auth gate: every page it wraps is rendered only after a
// valid admin/manager session is confirmed (server-side, in this RSC).
//
// Step 09 (Cache Components): the auth gate reads the session cookie — purely
// request-time work — and the admin pages read uncached DB data. The whole
// authenticated section is therefore dynamic, so we wrap it (chrome + children)
// in a single <Suspense> boundary to satisfy the "no dynamic work outside
// Suspense" rule. There's no useful static shell for an auth-gated page.
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

function AdminShellFallback() {
  return (
    <div className="grid min-h-dvh place-items-center bg-slate-100 text-slate-500">
      Chargement de l’administration…
    </div>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  // Not signed in → go log in. Signed in but not staff (a customer) → send to
  // the storefront instead of /login, otherwise we'd bounce in a redirect loop.
  if (!user) redirect("/login");
  if (!isStaff(user.role)) redirect("/");

  return (
    <div className="grid min-h-dvh grid-cols-[220px_1fr] bg-slate-100 text-slate-900">
      <aside className="flex flex-col gap-6 bg-slate-900 px-5 py-6 text-slate-100">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">
            Back-office
          </p>
          <p className="mt-1 text-lg font-semibold">Supa Admin</p>
        </div>
        <nav className="flex flex-col gap-1 text-sm">
          <Link
            href="/admin/products"
            className="rounded-md px-3 py-2 text-slate-200 transition hover:bg-slate-800"
          >
            Produits
          </Link>
          <Link
            href="/admin/users"
            className="rounded-md px-3 py-2 text-slate-200 transition hover:bg-slate-800"
          >
            Utilisateurs
          </Link>
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-slate-400 transition hover:bg-slate-800"
          >
            ← Voir la boutique
          </Link>
        </nav>
      </aside>

      <div className="flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-4">
          <h1 className="text-lg font-semibold">Administration</h1>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">
              {user.name}{" "}
              <span className="text-slate-400">· {roleLabel(user.role)}</span>
            </span>
            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
