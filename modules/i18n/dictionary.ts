import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./config";
import fr from "./dictionaries/fr.json";
import en from "./dictionaries/en.json";

// Workshop step 07 — server-side dictionary access.
//
// Dictionaries are plain JSON keyed by category (nav, footer, language). They're
// small, so we import them statically and pick by locale (the Next docs show
// dynamic import() too — either works; static keeps types simple and avoids an
// async boundary per lookup).

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, en };

/** Read the active locale from the NEXT_LOCALE cookie (defaults to fr). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Convenience for components: returns both the active locale and its dictionary.
 * Reading the cookie makes the caller dynamic (request-time), so callers must be
 * inside a <Suspense> boundary under Cache Components.
 */
export async function getTranslations(): Promise<{
  locale: Locale;
  dict: Dictionary;
}> {
  const locale = await getLocale();
  return { locale, dict: dictionaries[locale] };
}
