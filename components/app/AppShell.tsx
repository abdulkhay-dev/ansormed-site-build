"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { I18nProvider } from "@/components/i18n/I18nProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { CartProvider } from "@/components/cart/CartProvider";
// Прелоадер временно отключён — см. место использования ниже.
// import { Preloader } from "@/components/layout/Preloader";
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

  // Клиентская навигация без перезагрузки. В статическом экспорте (один
  // index.html) next/link по клику пытается подгрузить данные несуществующего
  // маршрута и делает полную перезагрузку. Перехватываем клики по внутренним
  // ссылкам и переходим через history.pushState — Next синхронизирует
  // usePathname, и приложение перерисовывается на месте.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }
      const el = e.target as HTMLElement | null;
      // Интерактивные элементы внутри ссылки-карточки (кнопка «в корзину»)
      // сами гасят переход в своём onClick — не перехватываем их клик.
      if (el?.closest?.("[data-no-nav]")) return;
      const anchor = el?.closest?.("a");
      if (!anchor) return;
      const target = anchor.getAttribute("target");
      if ((target && target !== "_self") || anchor.hasAttribute("download"))
        return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(anchor.href, window.location.origin);
      } catch {
        return;
      }
      // Внешние ссылки, tel:, mailto: — не трогаем.
      if (url.origin !== window.location.origin) return;
      // Внутренний переход → SPA через pushState (перебивает обработчик next/link).
      e.preventDefault();
      e.stopPropagation();
      const dest = url.pathname + url.search + url.hash;
      const current =
        window.location.pathname +
        window.location.search +
        window.location.hash;
      if (dest !== current) {
        window.history.pushState(null, "", dest);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

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
      <AuthProvider>
        <CartProvider>
          <SiteJsonLd lang={lang} dict={dict} />
          {/* Прелоадер временно отключён (мешает отладке входа) — вернуть строку:
            <Preloader /> */}
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
        </CartProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
