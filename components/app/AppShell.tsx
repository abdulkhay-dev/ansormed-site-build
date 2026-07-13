"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { Preloader } from "@/components/layout/Preloader";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ContactFab } from "@/components/layout/ContactFab";
import { SiteJsonLd } from "@/components/seo/JsonLd";
import { getCategories, type Category } from "@/lib/data/categories";
import { getDictionary, langFromPath } from "@/lib/i18n";

/**
 * Клиентская оболочка SPA: определяет язык из URL, поднимает i18n-контекст и
 * общий каркас (прелоадер, шапка, подвал, кнопка связи). Категории для
 * шапки/подвала грузятся на клиенте один раз на язык.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lang = langFromPath(pathname);
  const dict = getDictionary(lang);
  const [categories, setCategories] = useState<Category[]>([]);

  // Синхронизируем <html lang> с активной локалью.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // Категории для навигации (шапка/подвал).
  useEffect(() => {
    let cancelled = false;
    getCategories(lang)
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [lang]);

  return (
    <I18nProvider lang={lang} dict={dict}>
      <SiteJsonLd lang={lang} dict={dict} />
      <Preloader />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
      >
        {dict.skipToContent}
      </a>
      <Header categories={categories} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer categories={categories} />
      <ContactFab />
    </I18nProvider>
  );
}
