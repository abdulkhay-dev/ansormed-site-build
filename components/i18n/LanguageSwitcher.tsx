"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { locales, localeLabels, isLocale } from "@/lib/i18n";
import { useDict, useLang } from "@/components/i18n/I18nProvider";
import { cn } from "@/lib/utils";

/** Заменяет первый сегмент пути целевой локалью (/ru/... ↔ /uz/...). */
function swapLocale(pathname: string, target: string): string {
  const parts = (pathname || "/").split("/");
  if (isLocale(parts[1])) parts[1] = target;
  else parts.splice(1, 0, target);
  return parts.join("/") || `/${target}`;
}

function SwitcherLinks({ className }: { className?: string }) {
  const lang = useLang();
  const dict = useDict();
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const qs = searchParams.toString();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-0.5",
        className,
      )}
      role="group"
      aria-label={dict.langSwitcher.aria}
    >
      {locales.map((loc) => {
        const active = loc === lang;
        const path = swapLocale(pathname, loc);
        return (
          <Link
            key={loc}
            href={qs ? `${path}?${qs}` : path}
            hrefLang={loc}
            aria-current={active ? "true" : undefined}
            className={cn(
              "inline-flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums transition-colors duration-200",
              active
                ? "bg-accent text-white shadow-soft"
                : "text-ink-muted hover:text-ink",
            )}
          >
            {localeLabels[loc]}
          </Link>
        );
      })}
    </div>
  );
}

/** Переключатель языка. useSearchParams обёрнут в Suspense — требование статического экспорта. */
export function LanguageSwitcher({ className }: { className?: string }) {
  return (
    <Suspense
      fallback={
        <div
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full border border-line bg-surface/70 p-0.5",
            className,
          )}
          aria-hidden="true"
        >
          {locales.map((loc) => (
            <span
              key={loc}
              className="inline-flex h-7 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold tabular-nums text-ink-muted"
            >
              {localeLabels[loc]}
            </span>
          ))}
        </div>
      }
    >
      <SwitcherLinks className={className} />
    </Suspense>
  );
}
