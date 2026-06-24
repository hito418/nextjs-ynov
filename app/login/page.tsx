import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/modules/account/auth";
import { landingPath } from "@/modules/account/domain/user";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Connexion" };

// Lives outside the (admin) group so it is NOT behind the auth gate — otherwise
// the gate would redirect the login page to itself. Already signed in? Skip it.
export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(landingPath(user.role));

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 shadow-sm">
        <Link
          href="/"
          className="font-script text-2xl text-ink"
        >
          My Supa Store
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-ink">Connexion</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Connectez-vous à votre compte.
        </p>

        <LoginForm />

        <div className="mt-6 space-y-1 rounded-lg bg-cream px-3 py-2 text-xs text-muted">
          <p>
            Démo client : <code>lea@example.com</code> / <code>supastore</code>
          </p>
          <p>
            Démo admin : <code>camille@supastore.test</code> /{" "}
            <code>supastore</code>
          </p>
        </div>
      </div>
    </main>
  );
}
