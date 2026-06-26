import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/modules/account/auth";
import { landingPath } from "@/modules/account/domain/user";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Inscription" };

// Mirrors the login page: the card is static, but the "already signed in? skip
// the form" check reads the session cookie. We isolate that cookie read in a
// Suspense-wrapped child so it stays a dynamic hole under Cache Components.
async function RedirectIfSignedIn() {
  const user = await getCurrentUser();
  if (user) redirect(landingPath(user.role));
  return null;
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-8 shadow-sm">
        <Link href="/" className="font-script text-2xl text-ink">
          My Supa Store
        </Link>
        <h1 className="mt-4 text-xl font-semibold text-ink">Inscription</h1>
        <p className="mt-1 mb-6 text-sm text-muted">
          Créez votre compte pour commander.
        </p>

        <RegisterForm />

        <p className="mt-6 text-center text-sm text-muted">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-ink underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  );
}
