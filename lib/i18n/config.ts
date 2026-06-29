/**
 * Конфигурация локализации сайта.
 *
 * Маршруты строятся с префиксом языка: /ru/... и /uz/...
 * Язык по умолчанию (ru) используется при заходе на корень / (см. public/index.html).
 */
export const locales = ["ru", "uz", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ru";

/** Узкое сужение строки к Locale (для проверки [lang] из URL). */
export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Человекочитаемые подписи для переключателя языка. */
export const localeLabels: Record<Locale, string> = {
  ru: "RU",
  uz: "UZ",
  en: "EN",
};
