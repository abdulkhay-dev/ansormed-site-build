"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";
import { getContent } from "@/lib/api";
import { CONTENT_PATHS, setStringPath } from "@/lib/i18n/content-fields";

interface I18nValue {
  lang: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  lang,
  dict,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  // Базовый словарь из сборки + переопределения текстов из админки (ru/uz).
  const [merged, setMerged] = useState<Dictionary>(dict);

  // Сбрасываем на серверный словарь при смене языка/сборки.
  useEffect(() => {
    setMerged(dict);
  }, [dict]);

  useEffect(() => {
    let cancelled = false;

    getContent()
      .then((rows) => {
        if (cancelled || rows.length === 0) return;
        const next = structuredClone(dict) as Dictionary;
        let changed = false;
        // Применяем контент по полному пути (row.key); section игнорируем —
        // он только «корзина» из-за enum'а API.
        for (const row of rows) {
          if (!CONTENT_PATHS.has(row.key)) continue;
          const value =
            lang === "uz" ? row.value_uz : lang === "en" ? row.value_en : row.value_ru;
          if (!value) continue;
          if (setStringPath(next, row.key, value)) changed = true;
        }
        if (changed && !cancelled) setMerged(next);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [lang, dict]);

  return (
    <I18nContext.Provider value={{ lang, dict: merged }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n должен использоваться внутри <I18nProvider>");
  }
  return ctx;
}

export function useDict(): Dictionary {
  return useI18n().dict;
}

export function useLang(): Locale {
  return useI18n().lang;
}
