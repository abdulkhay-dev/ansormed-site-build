import type { Metadata } from "next";
import { locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/data/site";

/** Канонический домен сайта. */
export const SITE_URL = "https://ansormed.uz";

/** Значение по языку с фолбэком на ru (например, *_en пустой). */
export function byLang(
  lang: string,
  ru: string | null,
  uz: string | null,
  en: string | null,
): string {
  if (lang === "uz") return (uz || ru || "").trim();
  if (lang === "en") return (en || ru || "").trim();
  return (ru || "").trim();
}

/** Готовит текст для meta description: снимает HTML, схлопывает пробелы, обрезает. */
export function metaText(raw: string, max = 160): string {
  const text = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

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
    keywords,
    ogLocale,
    image,
    ogType = "website",
  }: {
    title: string;
    description: string;
    /** SEO-ключевики: строка (через запятую) или массив. */
    keywords?: string | string[] | null;
    ogLocale?: string;
    /** Своя OG-картинка (абсолютный URL). По умолчанию — /og.png. */
    image?: string | null;
    ogType?: "website" | "article";
  },
): Metadata {
  const images = image
    ? [{ url: image }]
    : [{ url: "/og.png", width: 1200, height: 630, alt: site.name }];
  const kw =
    typeof keywords === "string"
      ? keywords.split(",").map((s) => s.trim()).filter(Boolean)
      : keywords ?? undefined;
  return {
    title,
    description,
    keywords: kw && kw.length ? kw : undefined,
    alternates: pageAlternates(lang, path),
    // Next не сливает openGraph между layout и страницей — задаём поля целиком.
    openGraph: {
      type: ogType,
      siteName: site.name,
      title: `${title} — ${site.name}`,
      description,
      url: localeUrl(lang, path),
      locale: ogLocale,
      images,
    },
  };
}
