import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/data/site";

/** Канонический домен сайта. */
export const SITE_URL = "https://ansormed.uz";

/** Нормализует «голый» путь страницы (без локали): "products" → "products". */
function normPath(path: string): string {
  return path.replace(/^\/+|\/+$/g, "");
}

/** URL страницы с локалью и завершающим слэшем (trailingSlash: true). */
export function localeUrl(lang: string, path = ""): string {
  const seg = normPath(path);
  return `${SITE_URL}/${lang}${seg ? `/${seg}` : ""}/`;
}

/**
 * canonical (на себя) + hreflang-альтернативы по всем локалям + x-default (ru).
 */
export function pageAlternates(lang: Locale, path = ""): Metadata["alternates"] {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[l] = localeUrl(l, path);
  languages["x-default"] = localeUrl("ru", path);
  return { canonical: localeUrl(lang, path), languages };
}

/**
 * Готовый блок метаданных страницы: title/description + canonical/hreflang +
 * og:url/title/description. Базовые og-поля (image, siteName, locale, type)
 * заданы в layout и наследуются.
 */
export function pageMetadata(
  lang: Locale,
  path: string,
  {
    title,
    description,
    ogLocale,
  }: { title: string; description: string; ogLocale?: string },
): Metadata {
  return {
    title,
    description,
    alternates: pageAlternates(lang, path),
    // Next не сливает openGraph между layout и страницей — задаём поля целиком.
    openGraph: {
      type: "website",
      siteName: site.name,
      title: `${title} — ${site.name}`,
      description,
      url: localeUrl(lang, path),
      locale: ogLocale,
      images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
    },
  };
}
