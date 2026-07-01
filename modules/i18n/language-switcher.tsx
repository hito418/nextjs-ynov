"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "./config";

// Workshop step 07 — the client-side language switch.
//
// Cookies can't be set through next/headers from a client component, but a
// non-httpOnly cookie can be set directly via document.cookie. After flipping
// NEXT_LOCALE we call router.refresh() so the server re-renders the (dynamic)
// nav/footer with the new dictionary — no full reload, no URL change.
//
// Labels come from a small local map because the switcher must show BOTH
// languages in their own tongue regardless of the active locale.

const LABELS: Record<Locale, string> = { fr: "FR", en: "EN" };
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

// Module-scope: writing document.cookie is a browser side effect, kept out of
// the component body so it isn't flagged as mutating external state.
function writeLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
}

export function LanguageSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function setLocale(locale: Locale) {
    if (locale === current) return;
    writeLocaleCookie(locale);
    startTransition(() => router.refresh());
  }

  return (
    <div
      className="flex items-center gap-1 text-xs"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map((locale, i) => (
        <span key={locale} className="flex items-center gap-1">
          {i > 0 && <span className="text-line" aria-hidden>·</span>}
          <button
            type="button"
            onClick={() => setLocale(locale)}
            aria-pressed={locale === current}
            disabled={isPending}
            className={
              locale === current
                ? "font-semibold text-ink"
                : "text-muted transition hover:text-ink disabled:opacity-50"
            }
          >
            {LABELS[locale]}
          </button>
        </span>
      ))}
    </div>
  );
}
