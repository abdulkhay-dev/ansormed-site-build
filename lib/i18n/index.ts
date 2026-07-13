import ru, { type Dictionary } from "./dictionaries/ru";
import uz from "./dictionaries/uz";
import en from "./dictionaries/en";
import { isLocale, defaultLocale, type Locale } from "./config";

export { locales, defaultLocale, isLocale, localeLabels } from "./config";
export type { Locale } from "./config";
export type { Dictionary } from "./dictionaries/ru";

const dictionaries: Record<Locale, Dictionary> = { ru, uz, en };

/** Синхронно возвращает словарь для локали. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Язык из пути `/{lang}/...` (клиентский SPA-роутинг); фолбэк — дефолтная локаль. */
export function langFromPath(pathname: string | null | undefined): Locale {
  const seg = (pathname ?? "").split("/").filter(Boolean)[0];
  return isLocale(seg) ? seg : defaultLocale;
}

/** Сегменты пути после локали: `/ru/product/x` → ["product","x"], `/ru` → []. */
export function routeSegments(pathname: string | null | undefined): string[] {
  const parts = (pathname ?? "").split("/").filter(Boolean);
  return parts.length && isLocale(parts[0]) ? parts.slice(1) : parts;
}

/**
 * Префиксует внутренний путь текущей локалью: "/products" → "/ru/products".
 * Внешние ссылки (http, mailto, tel, #, //) и уже локализованные пути
 * возвращаются без изменений.
 */
export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const seg = href.split(/[/?#]/)[1];
  if (isLocale(seg)) return href;
  return `/${locale}${href === "/" ? "" : href}`;
}

/** Телефон для href: оставляет только цифры и ведущий «+» ("+998 94 …" → "+99894…"). */
export function telHref(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/** Простая подстановка {ключей} в строке шаблона. */
export function interpolate(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}
