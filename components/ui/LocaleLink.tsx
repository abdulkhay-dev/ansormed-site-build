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
  ...props
}: ComponentProps<typeof Link>) {
  const lang = useLang();
  const localized =
    typeof href === "string" ? localizeHref(lang, href) : href;
  return <Link href={localized} {...props} />;
}
