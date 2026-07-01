// Workshop step 07 — i18n configuration (cookie-based, no URL prefix).
//
// The active locale lives in the `NEXT_LOCALE` cookie. This file is safe to
// import from both server and client code (proxy included) — it holds no
// server-only imports.

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** Name of the cookie holding the active locale. */
export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Pick the best supported locale from an `Accept-Language` header value.
 * Dependency-free (no negotiator): parse `fr-FR,fr;q=0.9,en;q=0.8`, sort by q,
 * return the first base language we support, else the default. Used by the proxy
 * when no cookie exists yet.
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number.parseFloat(qParam.split("=")[1]) : 1;
      return { base: tag.toLowerCase().split("-")[0], q: Number.isNaN(q) ? 0 : q };
    })
    .sort((a, b) => b.q - a.q);

  for (const { base } of ranked) {
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
