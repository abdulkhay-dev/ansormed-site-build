"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { localizeHref } from "@/lib/i18n";
import { useLang } from "@/components/i18n/I18nProvider";

/**
 * Обёртка над next/link, которая автоматически префиксует внутренние пути
 * текущей локалью (/products → /ru/products). Внешние ссылки и tel:/mailto:
 * остаются без изменений.
 */
export function LocaleLink({
  href,
  prefetch = false,
  ...props
}: ComponentProps<typeof Link>) {
  const lang = useLang();
  const localized =
    typeof href === "string" ? localizeHref(lang, href) : href;
  // prefetch выключен: в статическом экспорте нет данных под-маршрутов, а
  // переход выполняет клиентский перехватчик в AppShell.
  return <Link href={localized} prefetch={prefetch} {...props} />;
}
