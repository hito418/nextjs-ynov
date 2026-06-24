import Link from "next/link";

// Global 404. Triggered by unmatched URLs and by `notFound()` calls (e.g. an
// unknown product slug). Rendered inside the root layout.
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-script text-7xl text-gold-dark">Oups…</p>
      <h1 className="text-2xl font-semibold text-ink">
        Cette page est introuvable
      </h1>
      <p className="max-w-md text-muted">
        Le produit ou la page que vous cherchez n&apos;existe pas (ou plus).
        Elle a peut-être été retirée du catalogue.
      </p>
      <Link
        href="/"
        className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream transition hover:bg-gold-dark"
      >
        Retour à la boutique
      </Link>
    </main>
  );
}
