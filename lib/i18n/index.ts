import ru, { type Dictionary } from "./dictionaries/ru";
import uz from "./dictionaries/uz";
import { type Locale } from "./config";

export { locales, defaultLocale, isLocale, localeLabels } from "./config";
export type { Locale } from "./config";
export type { Dictionary } from "./dictionaries/ru";

const dictionaries: Record<Locale, Dictionary> = { ru, uz };

/** Синхронно возвращает словарь для локали. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/**
 * Префиксует внутренний путь текущей локалью: "/products" → "/ru/products".
 * Внешние ссылки (http, mailto, tel, #, //) и уже локализованные пути
 * возвращаются без изменений.
 */
export function localizeHref(locale: Locale, href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const seg = href.split(/[/?#]/)[1];
  if (seg === "ru" || seg === "uz") return href;
  return `/${locale}${href === "/" ? "" : href}`;
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
