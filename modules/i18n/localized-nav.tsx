import Link from "next/link";
import { getTranslations } from "./dictionary";
import { LanguageSwitcher } from "./language-switcher";

// Workshop step 07 — the translatable part of the header (the "Boutique/Shop"
// link + the language switch). It reads the NEXT_LOCALE cookie, so it's a
// request-time (dynamic) server component and must render inside <Suspense> —
// matching the pattern already used for AccountNav/CartSummary.
export async function LocalizedNav() {
  const { locale, dict } = await getTranslations();

  return (
    <>
      <Link href="/" className="text-ink/80 transition hover:text-ink">
        {dict.nav.shop}
      </Link>
      <LanguageSwitcher current={locale} />
    </>
  );
}
