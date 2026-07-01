import { getTranslations } from "@/modules/i18n/dictionary";

// Workshop step 07 — the footer is now translated.
//
// It previously used `use cache` (step 09) to prerender the current year into
// the static shell. i18n changes that: reading the NEXT_LOCALE cookie is a
// request-time operation, incompatible with `use cache`. So the footer becomes a
// dynamic server component and is rendered inside a <Suspense> boundary by the
// shop layout. The year is still computed server-side (no client component).
export async function Footer() {
  const { dict } = await getTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>
          <span className="font-script text-lg text-ink">My Supa Store</span> —{" "}
          {dict.footer.tagline}
        </p>
        <p>
          © {year} · {dict.footer.copy}
        </p>
      </div>
    </footer>
  );
}
