import { cacheLife } from "next/cache";

// Workshop step 09 — "Footer, on use cache pour éviter un use client".
//
// The footer wants to show the current year (new Date()), which is
// non-deterministic. Under Cache Components that would force the surrounding
// scope out of the static shell (or push us toward a client component just to
// read the date). Marking the component `use cache` lets it evaluate the date
// once at cache-fill time and prerender into the shell — no "use client", no
// dynamic rendering. cacheLife('max') keeps it effectively static.
export async function Footer() {
  "use cache";
  cacheLife("max");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>
          <span className="font-script text-lg text-ink">My Supa Store</span> —
          atelier Next.js
        </p>
        <p>© {year} · Que du mock, pas de vraie commande</p>
      </div>
    </footer>
  );
}
